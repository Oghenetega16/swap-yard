import { Bell, ChevronDown } from "lucide-react";

export default function Topbar({ title, subtitle, right }) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 lg:px-8">
      <div>
        {title && <h1 className="text-xl font-bold text-ink">{title}</h1>}
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {right}
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink/70 hover:bg-black/[0.03]"
        >
          <Bell size={18} />
        </button>
        <button className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 hover:bg-black/[0.02]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
            AU
          </div>
          <span className="text-left leading-tight">
            <span className="block text-[13px] font-semibold text-ink">Admin User</span>
            <span className="block text-[11px] text-muted">Super Admin</span>
          </span>
          <ChevronDown size={14} className="text-muted" />
        </button>
      </div>
    </header>
  );
}
