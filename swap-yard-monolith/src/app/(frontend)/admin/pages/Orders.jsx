import { ShoppingBag } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Orders() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={ShoppingBag}
        title="No orders data wired up yet"
        description="Build this out with the same UsersTable pattern: an OrdersFilters bar, an OrdersTable, and a Pagination footer."
      />
    </div>
  );
}
