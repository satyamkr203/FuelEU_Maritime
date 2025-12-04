// src/adapters/inbound/http/bankingController.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = Router();

/**
 * GET /banking/records?shipId=&year=
 */
router.get("/records", async (req: Request, res: Response) => {
  try {
    const shipId = String(req.query.shipId ?? "");
    const year = Number(req.query.year ?? 0);
    if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });
    const entries = await prisma.bank_entries.findMany({ where: { ship_id: shipId, year }, orderBy: { created_at: "asc" } });
    const sum = entries.reduce((acc, e) => acc + Number(e.amount_gco2eq), 0);

    res.json({ shipId, year, entries, totalBanked: sum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bank records" });
  }
});

/**
 * POST /banking/bank
 * body: { shipId, year, amount } -- amount must be >0
 */
router.post("/bank", async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;
    if (!shipId || !year || typeof amount !== "number") return res.status(400).json({ error: "shipId, year, amount required" });
    if (amount <= 0) return res.status(400).json({ error: "amount must be positive" });

    const entry = await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: amount } });
    res.json({ message: "Banked", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bank surplus" });
  }
});

/**
 * POST /banking/apply
 * body: { shipId, year, amount } -- apply banked surplus to deficit (amount >0)
 */
router.post("/apply", async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;
    if (!shipId || !year || typeof amount !== "number") return res.status(400).json({ error: "shipId, year, amount required" });
    if (amount <= 0) return res.status(400).json({ error: "amount must be positive" });

    // computing available banked
    const resAgg = await prisma.bank_entries.aggregate({ where: { ship_id: shipId, year }, _sum: { amount_gco2eq: true } });
    const available = Number(resAgg._sum.amount_gco2eq ?? 0);
    if (amount > available) return res.status(400).json({ error: "Insufficient banked amount" });

    // creating negative entry to represent application
    const entry = await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: -Math.abs(amount) } });

    // optional: record applied change in ship_compliance or separate ledger (not implemented)
    res.json({ message: "Applied banked amount", applied: amount, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply banked amount" });
  }
});

export default router;
