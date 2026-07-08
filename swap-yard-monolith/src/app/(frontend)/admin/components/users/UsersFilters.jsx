import { Search, SlidersHorizontal, Download } from "lucide-react";

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

export default function UsersFilters({ filters, onFilterChange, onExport }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4">
      <label className="flex min-w-[220px] flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-transparent select-none">search</span>
        <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
          <Search size={16} className="text-muted" />
          <input
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full text-sm outline-none placeholder:text-muted"
          />
        </div>
      </label>

      <FilterSelect
        label="Roles"
        value={filters.role}
        onChange={(v) => onFilterChange("role", v)}
        options={["All Roles", "Buyer", "Seller"]}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(v) => onFilterChange("status", v)}
        options={["All Status", "Active", "Suspended"]}
      />
      <FilterSelect
        label="Verification"
        value={filters.verification}
        onChange={(v) => onFilterChange("verification", v)}
        options={["All", "Verified", "Pending"]}
      />

      <button className="flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink">
        <SlidersHorizontal size={15} /> Filters
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-2 rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white"
      >
        <Download size={15} /> Export
      </button>
    </div>
  );
}
