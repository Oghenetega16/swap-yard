import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";

const RANGE_OPTIONS = ["Last 7 days", "Last 30 days", "Last 90 days"];

export default function OverviewChart({ data }) {
  const [range, setRange] = useState("Last 30 days");

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Overview</h3>
          <p className="text-xs text-muted">Last 30 days</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-info" /> New Users
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2 w-2 rounded-full bg-danger" /> Orders
        </span>
      </div>

      <div className="mt-3 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#EAECF0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A94A6" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "#8A94A6" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #EAECF0", fontSize: 12 }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Line type="monotone" dataKey="newUsers" stroke="#2563EB" strokeWidth={2} dot={false} name="New Users" />
            <Line type="monotone" dataKey="orders" stroke="#DC2626" strokeWidth={2} dot={false} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
