"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, Users, ShieldAlert, ShoppingBag, 
  ArrowLeftRight, BarChart3, CreditCard, Settings, LogOut, Bell
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutGrid },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Listings", href: "/admin/listings", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Reports & Complaints", href: "/admin/reports", icon: ShieldAlert },
  { name: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { name: "Payouts", href: "/admin/payouts", icon: CreditCard },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* Mock Logo Graphic */}
          <div className="w-8 h-8 bg-[#E11D48] rounded-lg flex items-center justify-center text-white font-bold text-xs">SY</div>
          <span className="font-bold text-xl tracking-tight text-slate-900">SwapYard</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 relative rounded-full hover:bg-slate-50 transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 border-l pl-4 border-slate-100">
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-medium text-sm">AU</div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-900 leading-tight">Admin User</p>
              <p className="text-slate-400">Super Admin</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 flex-1">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white border-r border-slate-100 fixed left-0 bottom-0 top-16 hidden md:flex flex-col justify-between p-4">
          <div className="space-y-6">
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-3">Admin Menu</p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-[#EA580C] text-white shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition w-full">
            <LogOut size={18} />
            Log out
          </button>
        </aside>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 md:pl-64 min-w-0 bg-[#F4F6F9]">
          <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}