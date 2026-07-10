"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data reflecting UI designs
const metrics = [
  { title: "Total Users", value: "33,467", change: "+ 14.2%", isUp: true, sub: "vs last 30 days", bg: "bg-blue-50 text-blue-600" },
  { title: "Total Sellers", value: "12,789", change: "+ 11.5%", isUp: true, sub: "vs last 30 days", bg: "bg-emerald-50 text-emerald-600" },
  { title: "Active Listings", value: "7,487", change: "+ 3.2%", isUp: true, sub: "vs last 30 days", bg: "bg-purple-50 text-purple-600" },
  { title: "Orders (Today)", value: "520", change: "+ 7.5%", isUp: true, sub: "vs yesterday", bg: "bg-amber-50 text-amber-600" },
  { title: "Revenue (Today)", value: "₦ 13,467", change: "+ 14.2%", isUp: true, sub: "vs yesterday", bg: "bg-cyan-50 text-cyan-600" },
  { title: "Pending reports", value: "13,487", change: "3 new reports", isUp: false, sub: "", bg: "bg-rose-50 text-rose-600" },
];

const chartData = [
  { name: "Apr 24", users: 300, orders: 120 },
  { name: "Apr 29", users: 500, orders: 200 },
  { name: "May 09", users: 450, orders: 180 },
  { name: "May 13", users: 700, orders: 300 },
  { name: "Jun 10", users: 550, orders: 240 },
  { name: "Jul 21", users: 620, orders: 290 },
];

const categoryData = [
  { name: "Furniture", value: 2410 },
  { name: "Kitchen & Dining", value: 2210 },
  { name: "Office", value: 1850 },
  { name: "Bedroom", value: 1300 },
  { name: "Decor", value: 970 },
];

const pieData = [
  { name: "Active", value: 8900, color: "#10B981" },
  { name: "Sold", value: 1950, color: "#3B82F6" },
  { name: "Pending", value: 423, color: "#F59E0B" },
  { name: "Rejected", value: 275, color: "#EF4444" },
];

export default function AdminDashboard() {
  return (
    <>
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
          <span>May 24, 2025</span>
        </button>
      </div>

      {/* Metrics Row Grid Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 block mb-2">{m.title}</span>
            <span className="text-xl font-bold text-slate-900 block tracking-tight mb-2">{m.value}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${m.bg}`}>
                {m.isUp ? <ArrowUpRight size={10} /> : null}
                {m.change}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row Charts and Recent logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line Chart container */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Overview</h3>
              <p className="text-xs text-slate-400">Last 30 days growth</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> New Users</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Orders</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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

        {/* Activity Feed Streams Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
              <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { label: "New user registered", desc: "John Williams joined as a buyer", time: "2m ago", color: "bg-emerald-100 text-emerald-600" },
                { label: "New listing created", desc: "Iphone 13 Pro Max by barca_77", time: "6m ago", color: "bg-purple-100 text-purple-600" },
                { label: "Order completed", desc: "Order #1234 completed", time: "12m ago", color: "bg-blue-100 text-blue-600" },
                { label: "New report received", desc: "Complaint filed against seller", time: "18m ago", color: "bg-rose-100 text-rose-600" },
              ].map((act, i) => (
                <div key={i} className="flex gap-3 text-xs items-start">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${act.color}`}>
                    {act.label[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{act.label}</p>
                    <p className="text-slate-400 text-[11px]">{act.desc}</p>
                  </div>
                  <span className="text-slate-400 text-[10px] white-space-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Distribution Layout Row charts indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories Bar Distribution bars layout */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Top Categories</h3>
            <button className="text-xs text-blue-600 font-semibold">View All</button>
          </div>
          <div className="space-y-3.5">
            {categoryData.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{cat.name}</span>
                  <span className="font-semibold text-slate-900">{cat.value}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(cat.value / 2500) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listings Circle Pie Chart breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Listings Overview</h3>
          <div className="flex items-center gap-2 justify-center h-44">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={28} outerRadius={44} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs space-y-1">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="text-slate-500">{p.name}: <strong className="text-slate-800">{p.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing vendors list profiles card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Top Sellers</h3>
            <button className="text-xs text-blue-600 font-semibold">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { name: "Lily's Collections", sales: "245 Listings" },
              { name: "John Traders", sales: "210 Listings" },
              { name: "Obi Furnitures", sales: "195 Listings" },
              { name: "Musa & Sales", sales: "180 Listings" },
            ].map((seller, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-400 w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600 text-[11px]">
                    {seller.name[0]}
                  </div>
                  <span className="font-semibold text-slate-800">{seller.name}</span>
                </div>
                <span className="text-slate-400 text-[11px] font-medium">{seller.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}