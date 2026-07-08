export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted">
          <Icon size={22} />
        </span>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
