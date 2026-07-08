import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ListingsOverviewChart({ data }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <h3 className="text-sm font-semibold text-ink">Listings Overview</h3>

      <div className="mx-auto h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 space-y-2">
        {data.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="flex-1 text-ink">{slice.label}</span>
            <span className="font-medium text-ink">
              {slice.value.toLocaleString()} ({slice.pct}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
