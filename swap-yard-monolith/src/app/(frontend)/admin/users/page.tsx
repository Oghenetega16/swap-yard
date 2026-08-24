"use client";

import React from "react";
import Link from "next/link";
import { Search, MoreHorizontal } from "lucide-react";
import { useAdminUsersList, type UserRole } from "@/hooks/admin/useAdminUsersList"

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function UsersAdminPage() {
  const { state, setters } = useAdminUsersList();

  const summaryCards = [
    { label: "Total Users", count: state.counts?.total },
    { label: "Buyers", count: state.counts?.buyers },
    { label: "Sellers", count: state.counts?.sellers },
  ];

  return (
    <>
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-xs text-slate-400 mt-0.5">Dashboard &gt; Users</p>
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm">
        {(["ALL", "BUYER", "SELLER", "ADMIN"] as const).map((r) => (
          <button
            key={r}
            onClick={() => {
              setters.setRole(r);
              setters.setPage(1);
            }}
            className={`pb-3 font-semibold transition-all relative ${
              state.role === r ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {r === "ALL" ? "All Users" : `${formatRole(r)}s`}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
            <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            <p className="text-xl font-bold text-slate-900 my-1">
              {card.count === undefined ? "—" : card.count.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={state.search}
            onChange={(e) => setters.setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-200 bg-[#F8FAFC]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <select
            value={state.role}
            onChange={(e) => {
              setters.setRole(e.target.value as UserRole | "ALL");
              setters.setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 font-medium"
          >
            <option value="ALL">Roles (All Roles)</option>
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {state.error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{state.error}</div>
      )}

      {/* Table */}
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
                <th className="p-4">Email Verified</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {state.isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : state.users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                state.users.map((user) => {
                  const displayName = [user.firstname, user.lastname].filter(Boolean).join(" ") || user.email;
                  const initial = (user.firstname?.[0] ?? user.email[0]).toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-600">
                          {initial}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{displayName}</p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {user.username ? `@${user.username}` : user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            user.role === "BUYER"
                              ? "bg-blue-50 text-blue-600"
                              : user.role === "SELLER"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-purple-50 text-purple-600"
                          }`}
                        >
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-normal">{user.email}</td>
                      <td className="p-4 text-slate-500 font-normal">{user.phoneNumber ?? "—"}</td>
                      <td className="p-4 text-slate-500 font-normal">{user.state ?? "—"}</td>
                      <td className="p-4 text-slate-500 font-normal">{formatDate(user.createdAt)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            user.emailVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {user.emailVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition inline-flex"
                          aria-label="View user"
                        >
                          <MoreHorizontal size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium bg-[#F8FAFC]">
          <span>
            Showing {state.users.length === 0 ? 0 : (state.meta.page - 1) * state.meta.limit + 1} to{" "}
            {Math.min(state.meta.page * state.meta.limit, state.meta.total)} of {state.meta.total} users
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setters.setPage(Math.max(1, state.page - 1))}
              disabled={state.page <= 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="px-2">
              Page {state.meta.page} of {Math.max(1, state.meta.pages)}
            </span>
            <button
              onClick={() => setters.setPage(Math.min(state.meta.pages || 1, state.page + 1))}
              disabled={state.page >= state.meta.pages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </>
  );
}