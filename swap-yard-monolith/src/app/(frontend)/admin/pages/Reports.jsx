import { Flag } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Reports() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={Flag}
        title="No reports yet"
        description="Complaints and disputes raised by buyers or sellers will show up here once the reports API is connected."
      />
    </div>
  );
}
