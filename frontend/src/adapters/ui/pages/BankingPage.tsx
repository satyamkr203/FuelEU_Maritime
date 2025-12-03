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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Banking</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input value={shipId} onChange={(e)=>setShipId(e.target.value)} className="p-2 border rounded" />
        <input value={String(year)} onChange={(e)=>setYear(Number(e.target.value)||year)} className="p-2 border rounded" />
        <input value={String(amount)} onChange={(e)=>setAmount(Number(e.target.value)||0)} className="p-2 border rounded" />
      </div>

      <div className="bg-white p-4 rounded shadow-sm mb-4">
        <h3 className="font-medium">CB Snapshot</h3>
        {cbLoading ? <p>Loading...</p> : <pre>{JSON.stringify(cbData, null, 2)}</pre>}
      </div>

      <div className="flex gap-2">
        <button onClick={onBank} className="bg-green-600 text-white px-3 py-1 rounded">Bank</button>
        <button onClick={onApply} className="bg-amber-600 text-white px-3 py-1 rounded">Apply</button>
      </div>

      <div className="mt-4 bg-white p-3 rounded shadow-sm">
        <h3 className="font-medium">Bank Records</h3>
        <pre>{JSON.stringify(records, null, 2)}</pre>
      </div>
    </div>
  );
}
