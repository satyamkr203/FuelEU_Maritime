import React from "react";

export default function Filters({
  vesselType,
  fuelType,
  year,
  onChange,
}: {
  vesselType?: string;
  fuelType?: string;
  year?: number;
  onChange: (vals: { vesselType?: string; fuelType?: string; year?: number }) => void;
}) {
  return (
    <div className="flex gap-2 items-center mb-4">
      <input placeholder="VesselType" value={vesselType ?? ""} onChange={(e)=>onChange({ vesselType:e.target.value, fuelType, year })} className="px-2 py-1 border rounded" />
      <input placeholder="FuelType" value={fuelType ?? ""} onChange={(e)=>onChange({ vesselType, fuelType:e.target.value, year })} className="px-2 py-1 border rounded" />
      <input placeholder="Year" value={year ?? ""} onChange={(e)=>onChange({ vesselType, fuelType, year: Number(e.target.value)||undefined })} className="px-2 py-1 border rounded w-24"/>
    </div>
  );
}
