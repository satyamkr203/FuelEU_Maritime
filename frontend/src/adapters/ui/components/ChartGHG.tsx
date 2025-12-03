import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ChartGHG({ series }: { series: { label: string; value: number }[] }) {
  return (
    <div className="w-full h-64 bg-white p-3 rounded shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
