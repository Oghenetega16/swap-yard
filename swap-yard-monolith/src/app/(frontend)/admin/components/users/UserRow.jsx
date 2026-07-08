import { MoreVertical } from "lucide-react";
import Badge from "../common/Badge";

const AVATAR_COLORS = ["#F1502A", "#2563EB", "#16A34A", "#C77D06", "#7C3AED", "#DB2777"];

function initials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function UserRow({ user }) {
  const color = AVATAR_COLORS[user.id % AVATAR_COLORS.length];

  return (
    <tr className="border-b border-line last:border-0 hover:bg-surface/60">
      <td className="whitespace-nowrap py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.handle}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <Badge variant={user.role === "Seller" ? "info" : "neutral"}>{user.role}</Badge>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-[13.5px] text-ink">{user.email}</td>
      <td className="whitespace-nowrap px-3 py-3 text-[13.5px] text-ink">{user.phone}</td>
      <td className="whitespace-nowrap px-3 py-3 text-[13.5px] text-ink">{user.location}</td>
      <td className="whitespace-nowrap px-3 py-3 text-[13.5px] text-ink">{user.joinedOn}</td>
      <td className="whitespace-nowrap px-3 py-3">
        <Badge variant={user.verification === "Verified" ? "success" : "warning"} withIcon>
          {user.verification}
        </Badge>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <Badge variant={user.status === "Active" ? "success" : "danger"}>{user.status}</Badge>
      </td>
      <td className="whitespace-nowrap py-3 pl-3 pr-4 text-right">
        <button
          aria-label={`More actions for ${user.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
        >
          <MoreVertical size={16} className="text-muted" />
        </button>
      </td>
    </tr>
  );
}
