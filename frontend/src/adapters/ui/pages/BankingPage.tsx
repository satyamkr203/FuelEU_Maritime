import React, { useState } from "react";
import { useCB, useBankRecords, useBankMutations } from "../../infrastructure/api/hooks/useBanking";

export default function BankingPage() {
  const [shipId, setShipId] = useState("R002");
  const [year, setYear] = useState(2024);
  const [amount, setAmount] = useState<number>(0);

  const { data: cbData, isLoading: cbLoading } = useCB(shipId, year);
  const { data: records } = useBankRecords(shipId, year);
  const { bank, apply } = useBankMutations();

  const onBank = async () => { await bank.mutateAsync({ shipId, year, amount }); };
  const onApply = async () => { await apply.mutateAsync({ shipId, year, amount }); };

  // helpers
  const pretty = (v: any) =>
    typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v ?? "-";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Banking</h2>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          value={shipId}
          onChange={(e) => setShipId(e.target.value)}
          className="p-2 border rounded"
          placeholder="Ship ID"
        />
        <input
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value) || year)}
          className="p-2 border rounded"
          placeholder="Year"
          type="number"
        />
        <input
          value={String(amount)}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="p-2 border rounded"
          placeholder="Amount (gCO₂e)"
          type="number"
        />
      </div>

      {/* CB Snapshot */}
      <div className="bg-white p-4 rounded shadow-sm mb-4">
        <h3 className="font-medium mb-2">CB Snapshot</h3>

        {cbLoading && <p className="text-sm text-slate-500">Loading...</p>}

        {!cbLoading && cbData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-500 text-xs">Ship</div>
              <div className="font-semibold">{cbData.shipId}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs">Year</div>
              <div className="font-semibold">{cbData.year}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs">CB (gCO₂e)</div>
              <div className="font-semibold">{pretty(cbData.cbBefore)}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs">Snapshot ID</div>
              <div className="font-mono">{cbData.snapshotId ?? "-"}</div>
            </div>
          </div>
        )}

        {!cbLoading && !cbData && (
          <p className="text-sm text-slate-500">No snapshot available.</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onBank}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Bank
        </button>
        <button
          onClick={onApply}
          className="bg-amber-600 text-white px-3 py-1 rounded"
        >
          Apply
        </button>
      </div>

      {/* Bank Records */}
      <div className="bg-white p-3 rounded shadow-sm">
        <h3 className="font-medium mb-3">Bank Records</h3>

        {!records || !records.entries || records.entries.length === 0 ? (
          <p className="text-sm text-slate-500">No bank records found.</p>
        ) : (
          <table className="w-full table-auto text-sm border">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-1 text-left">ID</th>
                <th className="px-2 py-1 text-left">Ship</th>
                <th className="px-2 py-1 text-left">Year</th>
                <th className="px-2 py-1 text-right">Amount (gCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {records.entries.map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="px-2 py-1">{r.id}</td>
                  <td className="px-2 py-1">{r.ship_id}</td>
                  <td className="px-2 py-1">{r.year}</td>
                  <td className="px-2 py-1 text-right">{pretty(r.amount_gco2eq)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
