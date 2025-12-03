// computeCB.ts
export const TARGET_INTENSITY = 89.3368; // gCO2e/MJ
export const MJ_PER_TONNE = 41000; // MJ/t

export function computeCB(ghgIntensity: number, fuelTons: number): number {
  const energyMJ = fuelTons * MJ_PER_TONNE;
  const cb = (TARGET_INTENSITY - ghgIntensity) * energyMJ;
  return cb; // in gCO2e
}
