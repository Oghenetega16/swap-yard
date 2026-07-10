"use client";

import React, { useState } from "react";
import { Search, Filter, Download, MoreHorizontal, Plus } from "lucide-react";

const tabs = ["All Users", "Buyers", "Sellers", "Suspended"];

const summaryCards = [
  { label: "Total Users", count: "33,467", badge: "▲ 14.2% vs last 30 days", isUp: true },
  { label: "Buyers", count: "5,098", badge: "▲ 14.1% vs last 30 days", isUp: true },
  { label: "Sellers", count: "12,789", badge: "▲ 15.5% vs last 30 days", isUp: true },
  { label: "Suspended", count: "120", badge: "▲ 4.2% vs last 30 days", isUp: true },
  { label: "Verified Users", count: "10,267", badge: "▲ 12.2% vs last 30 days", isUp: true },
];

const mockUsers = [
  { id: 1, name: "Temi Adeyemi", handle: "@temi_a", role: "Buyer", email: "temiadeyemi@gmail.com", phone: "0807 123 4567", location: "Lagos, Nigeria", joined: "May 17, 2025", verified: "Verified", status: "Active" },
  { id: 2, name: "Emeka Chidi", handle: "@emeka_c", role: "Seller", email: "emekachidi@gmail.com", phone: "0807 123 4567", location: "Enugu, Nigeria", joined: "May 17, 2025", verified: "Pending", status: "Active" },
  { id: 3, name: "Lily Collections", handle: "@lily_collections", role: "Seller", email: "lilycollections@gmail.com", phone: "0807 123 4567", location: "Ibadan, Nigeria", joined: "May 17, 2025", verified: "Verified", status: "Suspended" },
  { id: 4, name: "Temi Adeyemi", handle: "@temi_a", role: "Buyer", email: "temiadeyemi@gmail.com", phone: "0807 123 4567", location: "Lagos, Nigeria", joined: "May 17, 2025", verified: "Verified", status: "Active" },
  { id: 5, name: "Temi Adeyemi", handle: "@temi_a", role: "Buyer", email: "temiadeyemi@gmail.com", phone: "0807 123 4567", location: "Lagos, Nigeria", joined: "May 17, 2025", verified: "Verified", status: "Active" },
];

export default function UsersAdminPage() {
  const [activeTab, setActiveTab] = useState("All Users");

  return (
    <>
      {/* Title Header with Action controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-xs text-slate-400 mt-0.5">Dashboard &gt; Users</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#0F172A] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-800 transition">
          <Plus size={14} /> Add new user
        </button>
      </div>

      {/* Segment tabs filtering layout row */}
      <div className="flex border-b border-slate-200 gap-6 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold transition-all relative ${
              activeTab === tab ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mini Segment cards sub-metrics tracking layout */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
            <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            <p className="text-xl font-bold text-slate-900 my-1">{card.count}</p>
            <p className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
              {card.badge}
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Filters row actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-200 bg-[#F8FAFC]"
          />
        </div>
        
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <select className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 font-medium">
            <option>Roles (All Roles)</option>
          </select>
          <select className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 font-medium">
            <option>Status (All Status)</option>
          </select>
          <select className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 font-medium">
            <option>Verification (All)</option>
          </select>
          
          <button className="flex items-center gap-1.5 border border-slate-200 px-3 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 border border-slate-200 px-3 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Main Responsive Table Interface Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Location</th>
                <th className="p-4">Joined On</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-600">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{user.handle}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      user.role === "Buyer" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-normal">{user.email}</td>
                  <td className="p-4 text-slate-500 font-normal">{user.phone}</td>
                  <td className="p-4 text-slate-500 font-normal">{user.location}</td>
                  <td className="p-4 text-slate-500 font-normal">{user.joined}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      user.verified === "Verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {user.verified}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      user.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Data Pagination block layout design */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium bg-[#F8FAFC]">
          <span>Showing 1 to 5 of 33,467 users</span>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 rounded-lg bg-[#0F172A] text-white font-bold">1</button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">2</button>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">3</button>
            <span className="px-1">...</span>
            <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">1,550</button>
            <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">&gt;</button>
          </div>
        </div>
      </div>
    </>
  );
}