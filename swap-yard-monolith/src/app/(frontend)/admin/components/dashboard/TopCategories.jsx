import { Sofa, UtensilsCrossed, Briefcase, BedDouble, Lamp, Baby } from "lucide-react";

const CATEGORY_ICON = {
  Furniture: Sofa,
  "Kitchen & Dining": UtensilsCrossed,
  Office: Briefcase,
  Bedroom: BedDouble,
  Decor: Lamp,
  "Baby & Kids": Baby,
};

function CategoryRow({ category }) {
  const Icon = CATEGORY_ICON[category.name] || Sofa;
  const pct = Math.round((category.value / category.max) * 100);
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Icon size={16} className="shrink-0 text-muted" />
      <span className="w-32 shrink-0 text-[13px] text-ink">{category.name}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right text-[13px] font-medium text-ink">
        {category.value.toLocaleString()}
      </span>
    </li>
  );
}

export default function TopCategories({ categories }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Top Categories</h3>
        <button className="text-xs font-semibold text-brand">View All</button>
      </div>
      <ul className="divide-y divide-line">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </ul>
    </div>
  );
}
