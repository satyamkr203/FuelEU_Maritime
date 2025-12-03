import React, { useState } from "react";
import { useAdjustedCB, useCreatePool } from "../../infrastructure/api/hooks/usePooling";

export default function PoolingPage() {
  const [year, setYear] = useState(2024);
  const { data, isLoading } = useAdjustedCB(year) as { data?: { adjusted: { shipId: string; cbBefore: number }[] }, isLoading: boolean };
  const createPool = useCreatePool();

  const [members, setMembers] = useState<{ shipId: string; cbBefore: number }[]>([]);

  React.useEffect(() => {
    if (data && Array.isArray(data.adjusted)) {
      setMembers(data.adjusted.map((m: { shipId: string; cbBefore: number }) => ({ shipId: m.shipId, cbBefore: m.cbBefore })));
    }
  }, [data]);

  const sum = members.reduce((s, m)=> s + Number(m.cbBefore), 0);
  const valid = sum >= 0;

  const onCreate = async () => {
    const res = await createPool.mutateAsync({ year, members }) as { poolId: string };
    alert("Pool created: " + res.poolId);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Pooling</h2>

      <div className="mb-3 flex gap-2">
        <input value={String(year)} onChange={(e)=>setYear(Number(e.target.value)||year)} className="p-2 border rounded w-24"/>
        <div>Sum: <span className={valid ? "text-green-600" : "text-red-600"}>{(sum/1e6).toFixed(2)} tCO₂e</span></div>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="bg-white p-3 rounded shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-100"><tr><th>Ship</th><th>CB Before (g)</th></tr></thead>
            <tbody>
              {members.map(m=>(
                <tr key={m.shipId} className="odd:bg-white even:bg-slate-50">
                  <td className="p-2">{m.shipId}</td>
                  <td className="p-2">{m.cbBefore}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3">
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={onCreate} disabled={!valid}>Create Pool</button>
          </div>
        </div>
      )}
    </div>
  );
}
