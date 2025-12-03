// src/adapters/outbound/prisma/complianceRepositoryPrisma.ts
import prisma from "../../../infrastructure/db/prismaClient";
import { ComplianceRepository } from "../../../core/ports/ComplianceRepository";
import { ShipCompliance } from "../../../core/domain/ShipCompliance";

export class ComplianceRepositoryPrisma implements ComplianceRepository {
  async getCBSnapshot(shipId: string, year: number): Promise<ShipCompliance | null> {
    const r = await prisma.ship_compliance.findFirst({ where: { ship_id: shipId, year } });
    return r ? { id: r.id, shipId: r.ship_id, year: r.year, cbGco2eq: Number(r.cb_gco2eq), createdAt: r.created_at } : null;
  }

  async saveCBSnapshot(record: ShipCompliance): Promise<ShipCompliance> {
    const created = await prisma.ship_compliance.create({
      data: { ship_id: record.shipId, year: record.year, cb_gco2eq: record.cbGco2eq },
    });
    return { id: created.id, shipId: created.ship_id, year: created.year, cbGco2eq: Number(created.cb_gco2eq), createdAt: created.created_at };
  }

  async getAdjustedCB(year: number) {
    // For simplicity, return latest ship_compliance entries by ship for given year,
    // plus applied bank entries (we'll assume bank entries are already applied)
    // Here we compute cbBefore from ship_compliance table; cbAfter equals cbBefore for now.
    const rows = await prisma.ship_compliance.findMany({ where: { year } });
    const grouped = rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.ship_id] = Number(r.cb_gco2eq);
      return acc;
    }, {});
    return Object.entries(grouped).map(([shipId, cb]) => ({ shipId, cbBefore: cb, cbAfter: cb }));
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    const res = await prisma.bank_entries.aggregate({
      where: { ship_id: shipId, year },
      _sum: { amount_gco2eq: true },
    });
    return Number(res._sum.amount_gco2eq ?? 0);
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<void> {
    await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: amount } });
  }

  async applyBanked(shipId: string, year: number, amount: number): Promise<void> {
    // record negative bank entry representing application (or positive depending on your convention)
    await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: -Math.abs(amount) } });
  }

  async getBankEntries(shipId: string, year: number) {
    return prisma.bank_entries.findMany({ where: { ship_id: shipId, year }, orderBy: { created_at: "asc" } });
  }

  async createPool(year: number, members: { shipId: string; cbBefore: number }[]) {
    return await prisma.$transaction(async (tx) => {
      const pool = await tx.pools.create({ data: { year } });
      const allocations: { shipId: string; cbBefore: number; cbAfter: number }[] = [];

      // greedy algorithm: sort surplus desc, deficits asc
      const membersCopy = members.map((m) => ({ ...m }));
      const deficits = membersCopy.filter((m) => m.cbBefore < 0).sort((a, b) => a.cbBefore - b.cbBefore);
      const surpluses = membersCopy.filter((m) => m.cbBefore > 0).sort((a, b) => b.cbBefore - a.cbBefore);

      for (const s of surpluses) {
        let remaining = s.cbBefore;
        for (const d of deficits) {
          if (remaining <= 0) break;
          const deficitNeed = Math.abs(d.cbBefore);
          const alreadyAllocated = 0; // we don't track partial allocation here in DB, compute cbAfter in-memory
          const transfer = Math.min(remaining, deficitNeed);
          remaining -= transfer;
          d.cbBefore += transfer; // reduce deficit (less negative)
          s.cbBefore -= transfer; // reduce surplus
        }
      }

      const membersAfter = [...deficits, ...surpluses, ...membersCopy.filter((m) => m.cbBefore === 0)];
      // persist pool_members
      for (const m of membersAfter) {
        const cbAfter = m.cbBefore;
        await tx.pool_members.create({
          data: { pool_id: pool.id, ship_id: m.shipId, cb_before: m.cbBefore, cb_after: cbAfter },
        });
        allocations.push({ shipId: m.shipId, cbBefore: m.cbBefore, cbAfter });
      }

      return { poolId: pool.id, members: allocations };
    });
  }
}
