// src/adapters/inbound/http/poolsController.ts
import { Router, Request, Response } from "express";
import prisma from "../../../infrastructure/db/prismaClient";

const router = Router();

/**
 * POST /pools
 * body: { year: number, members: [{ shipId, cbBefore }] }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { year, members } = req.body;
    if (!year || !Array.isArray(members) || members.length === 0) return res.status(400).json({ error: "year and members required" });

    const total = members.reduce((acc: number, m: any) => acc + Number(m.cbBefore), 0);
    if (total < 0) return res.status(400).json({ error: "Sum of adjusted CB must be >= 0" });

    // simple greedy allocation: sort surpluses descending and transfer to deficits
    const surpluses = members.filter((m: any) => m.cbBefore > 0).sort((a: any, b: any) => b.cbBefore - a.cbBefore);
    const deficits = members.filter((m: any) => m.cbBefore < 0).sort((a: any, b: any) => a.cbBefore - b.cbBefore);

    // make deep copy of cbBefore for computation
    const state: Record<string, { cbBefore: number; cbAfter: number }> = {};
    for (const m of members) state[m.shipId] = { cbBefore: Number(m.cbBefore), cbAfter: Number(m.cbBefore) };

    for (const s of surpluses) {
      let remaining = state[s.shipId].cbAfter;
      for (const d of deficits) {
        if (remaining <= 0) break;
        const need = Math.abs(state[d.shipId].cbAfter);
        const transfer = Math.min(remaining, need);
        state[s.shipId].cbAfter -= transfer;
        state[d.shipId].cbAfter += transfer;
        remaining = state[s.shipId].cbAfter;
      }
    }

    // persist pool and members
    const pool = await prisma.pools.create({ data: { year } });
    const membersPersisted = [];
    for (const id of Object.keys(state)) {
      const s = state[id];
      const pm = await prisma.pool_members.create({
        data: { pool_id: pool.id, ship_id: id, cb_before: s.cbBefore, cb_after: s.cbAfter },
      });
      membersPersisted.push(pm);
    }

    res.json({ poolId: pool.id, members: membersPersisted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create pool" });
  }
});

export default router;
