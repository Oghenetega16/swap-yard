import { Settings as SettingsIcon } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Settings() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={SettingsIcon}
        title="Platform settings"
        description="General, roles & permissions, and notification settings will be organized here as separate small form sections."
      />
    </div>
  );
}
