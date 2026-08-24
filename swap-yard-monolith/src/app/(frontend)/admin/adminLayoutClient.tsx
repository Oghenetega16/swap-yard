"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutGrid, Users, ShieldAlert, ShoppingBag, 
  ArrowLeftRight, BarChart3, CreditCard, Settings, LogOut, Bell
} from "lucide-react";
import Logo from "@/components/ui/Logo";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutGrid },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Reports & Complaints", href: "/admin/reports", icon: ShieldAlert },
  { name: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { name: "Payouts", href: "/admin/payouts", icon: CreditCard },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface CurrentUser {
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getInitials(firstname?: string, lastname?: string, email?: string) {
  const first = firstname?.trim()?.[0];
  const last = lastname?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return email?.slice(0, 2).toUpperCase() ?? "?";
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load current user");

        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error("Unexpected response from /api/auth/me");
        }

        const data = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch (err) {
        console.error("Failed to load current admin user:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  }

  const displayName = isLoading
    ? "Loading..."
    : user
    ? [user.firstname, user.lastname].filter(Boolean).join(" ") || user.email
    : "Guest";

  const displayRole = isLoading ? "" : user ? formatRole(user.role) : "";
  const initials = user ? getInitials(user.firstname, user.lastname, user.email) : "?";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Logo forceBlackTheme />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 relative rounded-full hover:bg-slate-50 transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 border-l pl-4 border-slate-100">
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-900 leading-tight">{displayName}</p>
              <p className="text-slate-400">{displayRole}</p>
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

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition w-full disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <div className="w-[18px] h-[18px] border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut size={18} />
            )}
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </aside>

        <main className="flex-1 md:pl-64 min-w-0 bg-[#F4F6F9]">
          <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}