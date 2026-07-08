import { BarChart3 } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Analytics() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={BarChart3}
        title="Analytics coming soon"
        description="Deeper platform trends — cohort retention, category growth, seller performance — will live here, built from the same chart components as the Dashboard."
      />
    </div>
  );
}
