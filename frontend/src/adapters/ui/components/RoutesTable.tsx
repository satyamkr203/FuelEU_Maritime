import React from "react";
import type { Route } from "../../../core/domain/Route";

export default function RoutesTable({
  data,
  onSetBaseline,
}: {
  data: Route[];
  onSetBaseline: (routeId: string) => Promise<any>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded shadow-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Route</th>
            <th className="p-2 text-left">Vessel</th>
            <th className="p-2 text-left">Fuel</th>
            <th className="p-2 text-left">Year</th>
            <th className="p-2 text-right">GHG (gCO₂e/MJ)</th>
            <th className="p-2 text-right">Fuel (t)</th>
            <th className="p-2 text-right">Distance (km)</th>
            <th className="p-2 text-right">Total Emis (t)</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.routeId} className="odd:bg-white even:bg-slate-50">
              <td className="p-2">{r.routeId}</td>
              <td className="p-2">{r.vesselType}</td>
              <td className="p-2">{r.fuelType}</td>
              <td className="p-2">{r.year}</td>
              <td className="p-2 text-right">{r.ghgIntensity}</td>
              <td className="p-2 text-right">{r.fuelConsumption}</td>
              <td className="p-2 text-right">{r.distance}</td>
              <td className="p-2 text-right">{r.totalEmissions}</td>
              <td className="p-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => onSetBaseline(r.routeId)}
                >
                  Set Baseline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
