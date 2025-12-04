import { useComparison } from "../../infrastructure/api/hooks/useComparison";
import ChartGHG from "../components/ChartGHG";

type Comparison = {
  routeId: string;
  ghgIntensity: number;
  percentDiff: number;
  compliant: boolean;
};

type ComparisonData = {
  baseline?: {
    routeId: string;
    ghgIntensity: number;
  };
  comparisons?: Comparison[];
  chartSeries?: { label: string; value: number }[];
};

export default function ComparePage() {
  const { data, isLoading, error } = useComparison();

  if (isLoading) return <p>Loading comparison...</p>;
  if (error) return <p className="text-red-600">Error loading comparison</p>;

  const typedData = data as ComparisonData;
  const baseline = typedData?.baseline;
  const comparisons = typedData?.comparisons ?? [];
  const chartSeries = typedData?.chartSeries ?? [
    {
      label: baseline?.routeId ?? "baseline",
      value: baseline?.ghgIntensity ?? 0,
    },
    ...comparisons.map((c: any) => ({
      label: c.routeId,
      value: c.ghgIntensity,
    })),
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Compare</h2>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium">Baseline</h3>
          <p className="text-lg">
            {baseline?.routeId} — {baseline?.ghgIntensity} gCO₂e/MJ
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-medium">Summary</h3>
          <p>{comparisons.length} comparisons</p>
        </div>
      </div>

      <ChartGHG series={chartSeries} />

      <div className="mt-4 bg-white p-3 rounded shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th>Route</th>
              <th>GHG</th>
              <th>% vs baseline</th>
              <th>Compliant</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c: any) => (
              <tr key={c.routeId} className="odd:bg-white even:bg-slate-50">
                <td className="p-2">{c.routeId}</td>
                <td className="p-2">{c.ghgIntensity}</td>
                <td className="p-2">{c.percentDiff.toFixed(2)}%</td>
                <td className="p-2">
                  {c.compliant ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      Compliant
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                      Non-compliant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
