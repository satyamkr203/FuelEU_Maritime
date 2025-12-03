// src/core/domain/ShipCompliance.ts
export type ShipCompliance = {
  id?: number;
  shipId: string;
  year: number;
  cbGco2eq: number; // in gCO2e
  createdAt?: Date;
};
