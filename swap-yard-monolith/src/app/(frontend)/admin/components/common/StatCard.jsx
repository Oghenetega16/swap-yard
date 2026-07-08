import { Users, Store, Package, ShoppingBag, Banknote, Flag, TrendingUp } from "lucide-react";

const ICONS = { users: Users, store: Store, package: Package, bag: ShoppingBag, banknote: Banknote, flag: Flag };

export default function StatCard({ label, value, delta, trend, period, icon }) {
  const Icon = ICONS[icon] || Users;
  const isFlag = trend === "flag";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-muted">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface">
          <Icon size={16} />
        </span>
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="flex items-center gap-1 text-xs">
        {isFlag ? (
          <span className="font-semibold text-danger">{delta}</span>
        ) : (
          <>
            <TrendingUp size={13} className="text-success" />
            <span className="font-semibold text-success">{delta}</span>
            <span className="text-muted">{period}</span>
          </>
        )}
      </div>
    </div>
  );
}
