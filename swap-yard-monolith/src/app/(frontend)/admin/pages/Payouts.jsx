import { Wallet } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Payouts() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={Wallet}
        title="No payout requests yet"
        description="Seller payout requests and approval history will appear here once connected to the payouts service."
      />
    </div>
  );
}
