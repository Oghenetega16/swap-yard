const AVATAR_COLORS = ["#F1502A", "#2563EB", "#16A34A", "#C77D06", "#7C3AED"];

function SellerRow({ seller, rank }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="w-4 text-[13px] font-semibold text-muted">{rank}</span>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: AVATAR_COLORS[rank % AVATAR_COLORS.length] }}
      >
        {seller.avatar}
      </span>
      <span className="flex-1 truncate text-[13px] font-medium text-ink">{seller.name}</span>
      <span className="text-xs text-muted">{seller.listings} listing</span>
    </li>
  );
}

export default function TopSellers({ sellers }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Top Sellers</h3>
        <button className="text-xs font-semibold text-brand">View All</button>
      </div>
      <ul className="divide-y divide-line">
        {sellers.map((s, i) => (
          <SellerRow key={s.id} seller={s} rank={i + 1} />
        ))}
      </ul>
    </div>
  );
}
