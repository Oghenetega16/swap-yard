import { Repeat } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Transactions() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={Repeat}
        title="No transactions data wired up yet"
        description="Payment history, refunds, and settlement records will appear here once connected to the payments provider."
      />
    </div>
  );
}
