import { Package } from "lucide-react";
import EmptyState from "../components/common/EmptyState";

export default function Listings() {
  return (
    <div className="pt-1">
      <EmptyState
        icon={Package}
        title="No listings data wired up yet"
        description="This page is scaffolded and ready — connect it to your listings API and reuse the same table/badge components from the Users page."
      />
    </div>
  );
}
