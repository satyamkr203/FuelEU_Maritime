import React, { useState } from "react";
import { useRoutes } from "../../infrastructure/api/hooks/useRoutes";
import RoutesTable from "../components/RoutesTable";

export default function RoutesPage() {
  const [filters, setFilters] = useState<any>(undefined);
  const { data = [], isLoading, error, setBaseline } = useRoutes(filters);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Routes</h2>
      <div className="mb-3 flex gap-2">
        <input placeholder="vesselType" onChange={e=>setFilters((f:any)=>({...f, vesselType: e.target.value}))} className="px-2 py-1 border rounded"/>
        <input placeholder="fuelType" onChange={e=>setFilters((f:any)=>({...f, fuelType: e.target.value}))} className="px-2 py-1 border rounded"/>
        <input placeholder="year" onChange={e=>setFilters((f:any)=>({...f, year: Number(e.target.value)||undefined}))} className="px-2 py-1 border rounded w-24"/>
      </div>

      {isLoading ? <p>Loading...</p> : <RoutesTable data={data} onSetBaseline={async (id) => { await setBaseline(id); }} />}

      {error && <div className="text-red-600 mt-3">Failed to load routes</div>}
    </div>
  );
}
