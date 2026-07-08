import { UserPlus, PackagePlus, ShoppingBag, Flag, UserCheck } from "lucide-react";

const TYPE_STYLE = {
  user: { icon: UserPlus, bg: "bg-info/10", fg: "text-info" },
  listing: { icon: PackagePlus, bg: "bg-brand-light", fg: "text-brand" },
  order: { icon: ShoppingBag, bg: "bg-warning-bg", fg: "text-warning" },
  report: { icon: Flag, bg: "bg-danger-bg", fg: "text-danger" },
  approval: { icon: UserCheck, bg: "bg-success-bg", fg: "text-success" },
};

function ActivityRow({ item }) {
  const style = TYPE_STYLE[item.type] || TYPE_STYLE.user;
  const Icon = style.icon;
  return (
    <li className="flex items-start gap-3 py-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.fg}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-ink">{item.title}</p>
        <p className="truncate text-xs text-muted">{item.detail}</p>
      </div>
      <span className="shrink-0 text-xs text-muted">{item.time}</span>
    </li>
  );
}

export default function RecentActivity({ items }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
        <button className="text-xs font-semibold text-brand">View All</button>
      </div>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
