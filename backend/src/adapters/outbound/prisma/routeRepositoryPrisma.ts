// src/adapters/outbound/prisma/routeRepositoryPrisma.ts
import prisma from "../../../infrastructure/db/prismaClient";
import { Route } from "../../../core/domain/Route";
import { RouteRepository } from "../../../core/ports/RouteRepository";

export class RouteRepositoryPrisma implements RouteRepository {
  async findAll(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    const where: any = {};
    if (filters?.vesselType) where.vessel_type = filters.vesselType;
    if (filters?.fuelType) where.fuel_type = filters.fuelType;
    if (filters?.year) where.year = filters.year;

    const rows = await prisma.routes.findMany({ where, orderBy: { id: "asc" } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: number): Promise<Route | null> {
    const r = await prisma.routes.findUnique({ where: { id } });
    return r ? this.toDomain(r) : null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const r = await prisma.routes.findUnique({ where: { route_id: routeId } });
    return r ? this.toDomain(r) : null;
  }

  async setBaseline(routeId: string): Promise<Route> {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.routes.updateMany({ where: { NOT: { route_id: routeId } }, data: { is_baseline: false } });
      const u = await tx.routes.update({ where: { route_id: routeId }, data: { is_baseline: true } });
      return u;
    });

    return this.toDomain(updated);
  }

  async unsetOtherBaselines(exceptRouteId: string): Promise<void> {
    await prisma.routes.updateMany({ where: { NOT: { route_id: exceptRouteId } }, data: { is_baseline: false } });
  }

  private toDomain(r: any): Route {
    return {
      id: r.id,
      routeId: r.route_id,
      vesselType: r.vessel_type,
      fuelType: r.fuel_type,
      year: r.year,
      ghgIntensity: Number(r.ghg_intensity),
      fuelConsumption: Number(r.fuel_consumption),
      distance: Number(r.distance_km),
      totalEmissions: Number(r.total_emissions),
      isBaseline: r.is_baseline,
    };
  }
}
