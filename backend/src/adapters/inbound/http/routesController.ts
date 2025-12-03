// src/adapters/inbound/http/routesController.ts
import { Router, Request, Response } from "express";
import { RouteRepositoryPrisma } from "../../outbound/prisma/routeRepositoryPrisma";
import { RouteRepository } from "../../../core/ports/RouteRepository";

const router = Router();
const repo: RouteRepository = new RouteRepositoryPrisma();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { vesselType, fuelType, year } = req.query;
    const filters: any = {};
    if (vesselType) filters.vesselType = String(vesselType);
    if (fuelType) filters.fuelType = String(fuelType);
    if (year) filters.year = Number(year);

    const routes = await repo.findAll(Object.keys(filters).length ? filters : undefined);
    res.json({ data: routes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

router.post("/:routeId/baseline", async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;
    const exists = await repo.findByRouteId(routeId);
    if (!exists) return res.status(404).json({ error: "Route not found" });

    const updated = await repo.setBaseline(routeId);
    res.json({ message: "Baseline set", data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set baseline" });
  }
});

export default router;
