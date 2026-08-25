"use client";

import React, { useMemo } from "react";
import { ArrowUpRight, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";

const METRIC_STYLES: Record<string, string> = {
  totalUsers: "bg-blue-50 text-blue-600",
  totalSellers: "bg-emerald-50 text-emerald-600",
  activeListings: "bg-purple-50 text-purple-600",
  ordersToday: "bg-amber-50 text-amber-600",
  revenueToday: "bg-cyan-50 text-cyan-600",
  pendingReports: "bg-rose-50 text-rose-600",
};

const ACTIVITY_COLORS: Record<string, string> = {
  user: "bg-emerald-100 text-emerald-600",
  listing: "bg-purple-100 text-purple-600",
  order: "bg-blue-100 text-blue-600",
  report: "bg-rose-100 text-rose-600",
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatMetricValue(value: number, isCurrency?: boolean) {
  return isCurrency ? currencyFormatter.format(value) : value.toLocaleString("en-US");
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const { state } = useAdminDashboard();

  const maxCategoryValue = useMemo(
    () => Math.max(1, ...state.categoryData.map((c) => c.value)),
    [state.categoryData]
  );

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    []
  );

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <>
      {state.error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium" role="alert">
          {state.error}
        </div>
      )}

      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-sm text-slate-500">Here's whats happening on SwapYard today.</p>
        </div>
        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm border border-slate-200 font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          <Calendar size={16} />
          <span>{today}</span>
        </button>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {state.metrics.map((m) => (
          <div key={m.key} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 block mb-2">{m.title}</span>
            <span className="text-xl font-bold text-slate-900 block tracking-tight mb-2">
              {formatMetricValue(m.value, m.isCurrency)}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${METRIC_STYLES[m.key] ?? "bg-slate-50 text-slate-600"}`}>
                {m.isUp ? <ArrowUpRight size={10} /> : null}
                {m.change}
              </span>
              {m.sub && <span className="text-[10px] text-slate-400 font-medium">{m.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: chart + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Overview</h3>
              <p className="text-xs text-slate-400">Last 14 days growth</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> New Users</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Orders</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="orders" stroke="#EF4444" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {state.activity.length === 0 ? (
                <p className="text-xs text-slate-400">No recent activity.</p>
              ) : (
                state.activity.map((act, i) => (
                  <div key={i} className="flex gap-3 text-xs items-start">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${ACTIVITY_COLORS[act.type]}`}>
                      {act.label[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{act.label}</p>
                      <p className="text-slate-400 text-[11px]">{act.desc}</p>
                    </div>
                    <span className="text-slate-400 text-[10px] whitespace-nowrap">{timeAgo(act.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: categories, listing status, top sellers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Top Categories</h3>
          </div>
          <div className="space-y-3.5">
            {state.categoryData.length === 0 ? (
              <p className="text-xs text-slate-400">No categories yet.</p>
            ) : (
              state.categoryData.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{cat.name}</span>
                    <span className="font-semibold text-slate-900">{cat.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(cat.value / maxCategoryValue) * 100}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Listings Overview</h3>
          {state.pieData.length === 0 ? (
            <p className="text-xs text-slate-400">No listings yet.</p>
          ) : (
            <div className="flex items-center gap-2 justify-center h-44">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={state.pieData} innerRadius={28} outerRadius={44} paddingAngle={3} dataKey="value">
                      {state.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs space-y-1">
                {state.pieData.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                    <span className="text-slate-500">{p.name}: <strong className="text-slate-800">{p.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Top Sellers</h3>
          </div>
          <div className="space-y-3">
            {state.topSellers.length === 0 ? (
              <p className="text-xs text-slate-400">No sellers yet.</p>
            ) : (
              state.topSellers.map((seller, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 text-[11px]">
                      {seller.name[0]}
                    </div>
                    <span className="font-semibold text-slate-800">{seller.name}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-medium">{seller.listingCount} Listings</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}