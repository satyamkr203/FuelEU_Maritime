// src/core/ports/ComplianceRepository.ts
import { ShipCompliance } from "../domain/ShipCompliance";

export interface ComplianceRepository {
  getCBSnapshot(shipId: string, year: number): Promise<ShipCompliance | null>;
  saveCBSnapshot(record: ShipCompliance): Promise<ShipCompliance>;
  getAdjustedCB(year: number): Promise<{ shipId: string; cbBefore: number; cbAfter?: number }[]>;
  getBankedAmount(shipId: string, year: number): Promise<number>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<void>;
  applyBanked(shipId: string, year: number, amount: number): Promise<void>;
  getBankEntries(shipId: string, year: number): Promise<{ id: number; amount_gco2eq: number; created_at: Date }[]>;
  createPool(year: number, members: { shipId: string; cbBefore: number }[]): Promise<{ poolId: number; members: { shipId: string; cbBefore: number; cbAfter: number }[] }>;
}
