import { ChevronLeft, ChevronRight } from "lucide-react";

function pageWindow(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current, "...", total];
}

export default function Pagination({ page, totalPages, totalItems, pageSize, onChange }) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-1 pt-4 text-sm text-muted">
      <span>
        Showing {start} to {end} of {totalItems.toLocaleString()} users
      </span>
      <div className="flex items-center gap-1.5">
        <button
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line disabled:opacity-40 hover:bg-surface"
        >
          <ChevronLeft size={16} />
        </button>
        {pageWindow(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium",
                p === page ? "bg-ink text-white" : "hover:bg-surface",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}
        <button
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line disabled:opacity-40 hover:bg-surface"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
