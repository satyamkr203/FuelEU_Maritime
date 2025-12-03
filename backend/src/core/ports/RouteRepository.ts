export interface RouteRecord {
  id: number;
  route_id: string;
  vessel_type: string;
  fuel_type: string;
  year: number;
  ghg_intensity: number;
  fuel_consumption: number;
  distance_km: number;
  total_emissions: number;
  is_baseline: boolean;
}

export interface RouteRepository {
  getAllRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<RouteRecord[]>;
  getByRouteId(routeId: string): Promise<RouteRecord | null>;
  setBaseline(routeId: string): Promise<void>;
}
