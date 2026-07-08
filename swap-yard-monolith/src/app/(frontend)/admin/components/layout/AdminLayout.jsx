import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_META = {
  "/": { title: "Welcome back, Admin! 👋", subtitle: "Here's what's happening on SwapYard today." },
  "/users": { title: "Users", subtitle: "Manage buyers and sellers on the platform." },
  "/listings": { title: "Listings", subtitle: "Review and moderate marketplace listings." },
  "/orders": { title: "Orders", subtitle: "Track orders placed across the platform." },
  "/reports": { title: "Reports & Complaints", subtitle: "Resolve disputes raised by users." },
  "/transactions": { title: "Transactions", subtitle: "All payment activity in one place." },
  "/analytics": { title: "Analytics", subtitle: "Platform performance over time." },
  "/payouts": { title: "Payouts", subtitle: "Manage seller payout requests." },
  "/settings": { title: "Settings", subtitle: "Configure platform-wide preferences." },
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || {};

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      <Sidebar onLogout={() => alert("Logged out (demo only)")} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 px-6 pb-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
