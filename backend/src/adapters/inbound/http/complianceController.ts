// src/adapters/inbound/http/complianceController.ts
import { Router, Request, Response } from "express";
import { RouteRepositoryPrisma } from "../../outbound/prisma/routeRepositoryPrisma";
import prisma from "../../../infrastructure/db/prismaClient";
import { computeCB, TARGET_INTENSITY } from "../../../core/application/computeCB";

const router = Router();
const routeRepo = new RouteRepositoryPrisma();

/**
 * GET /routes/comparison
 * Compares all routes to the baseline route (is_baseline = true)
 */
router.get("/routes/comparison", async (_req: Request, res: Response) => {
  try {
    const baselineRow = await prisma.routes.findFirst({ where: { is_baseline: true } });
    if (!baselineRow) return res.status(404).json({ error: "No baseline set" });

    const baselineIntensity = Number(baselineRow.ghg_intensity);
    const rows = await prisma.routes.findMany();

    const baselineRoutes = rows.filter((r) => r.route_id === baselineRow.route_id);
    const others = rows.filter((r) => r.route_id !== baselineRow.route_id);

    const results = others.map((r) => {
      const comparison = Number(r.ghg_intensity);
      const percentDiff = ((comparison / baselineIntensity) - 1) * 100;
      const compliant = comparison <= TARGET_INTENSITY;
      return {
        routeId: r.route_id,
        vesselType: r.vessel_type,
        fuelType: r.fuel_type,
        year: r.year,
        ghgIntensity: comparison,
        percentDiff,
        compliant,
      };
    });

    res.json({
      baseline: {
        routeId: baselineRow.route_id,
        ghgIntensity: Number(baselineRow.ghg_intensity),
      },
      comparisons: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute comparison" });
  }
});

/**
 * GET /compliance/cb?shipId=&year=
 * compute and store CB snapshot from route data (shipId==routeId here)
 */
router.get("/compliance/cb", async (req: Request, res: Response) => {
  try {
    const shipId = String(req.query.shipId ?? "");
    const year = Number(req.query.year ?? 0);
    if (!shipId || !year) return res.status(400).json({ error: "shipId and year required" });

    const route = await prisma.routes.findUnique({ where: { route_id: shipId } });
    if (!route) return res.status(404).json({ error: "Route not found" });

    const cb = computeCB(Number(route.ghg_intensity), Number(route.fuel_consumption)); // gCO2e
    // save snapshot
    const snapshot = await prisma.ship_compliance.create({
      data: { ship_id: shipId, year, cb_gco2eq: cb },
    });

    res.json({
      shipId,
      year,
      cbBefore: cb,
      snapshotId: snapshot.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute CB" });
  }
});

/**
 * GET /compliance/adjusted-cb?year=YYYY
 * returns adjusted CB per ship (here we return simple bank-adjusted CB)
 */
router.get("/compliance/adjusted-cb", async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year ?? 0);
    if (!year) return res.status(400).json({ error: "year required" });

    // get latest snapshots for year
    const snapshots = await prisma.ship_compliance.findMany({ where: { year } });

    // get bank sums per ship
    const banks = await prisma.bank_entries.findMany({ where: { year } });

    const bankSums: Record<string, number> = {};
    for (const b of banks) {
      bankSums[b.ship_id] = (bankSums[b.ship_id] ?? 0) + Number(b.amount_gco2eq);
    }

    const adjusted = snapshots.map((s) => {
      const cbBefore = Number(s.cb_gco2eq);
      const bank = bankSums[s.ship_id] ?? 0;
      const cbAfter = cbBefore + bank; // banked positive increases surplus (note: bank entries positive for stored surplus)
      return { shipId: s.ship_id, cbBefore, cbAfter };
    });

    res.json({ year, adjusted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch adjusted CB" });
  }
});

export default router;
