import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Users, Package, ShoppingBag, Flag, Repeat,
  BarChart3, Wallet, Settings, LogOut, Recycle,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/listings", label: "Listings", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/reports", label: "Reports & Complaints", icon: Flag },
  { to: "/transactions", label: "Transactions", icon: Repeat },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/payouts", label: "Payouts", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors",
          isActive
            ? "bg-brand text-white shadow-sm shadow-brand/30"
            : "text-ink/70 hover:bg-black/[0.04]",
        ].join(" ")
      }
    >
      <Icon size={18} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onLogout }) {
  return (
    <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-line bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
          <Recycle size={20} strokeWidth={2.2} />
        </div>
        <span className="text-lg font-bold tracking-tight">SwapYard</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <p className="px-3.5 pb-2 pt-2 text-[11px] font-semibold tracking-wider text-muted">
          ADMIN MENU
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      <div className="border-t border-line px-4 py-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-danger hover:bg-danger-bg transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
