import { CheckCircle2, Clock, Circle } from "lucide-react";

const VARIANTS = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info/10 text-info",
  neutral: "bg-surface text-muted",
};

const ICONS = { success: CheckCircle2, warning: Clock, danger: Circle };

export default function Badge({ children, variant = "neutral", withIcon = false }) {
  const Icon = ICONS[variant];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        VARIANTS[variant],
      ].join(" ")}
    >
      {withIcon && Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
