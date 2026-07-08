import { Calendar } from "lucide-react";
import StatCard from "../components/common/StatCard";
import OverviewChart from "../components/dashboard/OverviewChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import TopCategories from "../components/dashboard/TopCategories";
import ListingsOverviewChart from "../components/dashboard/ListingsOverviewChart";
import TopSellers from "../components/dashboard/TopSellers";
import {
  summaryStats, overviewSeries, recentActivity,
  topCategories, listingsOverview, topSellers,
} from "../data/mockData";

function DateRangeButton() {
  return (
    <button className="flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink">
      <Calendar size={15} className="text-muted" />
      May 24, 2025
    </button>
  );
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5 pt-1">
      <div className="flex justify-end">
        <DateRangeButton />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {summaryStats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <OverviewChart data={overviewSeries} />
        <RecentActivity items={recentActivity} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopCategories categories={topCategories} />
        <ListingsOverviewChart data={listingsOverview} />
        <TopSellers sellers={topSellers} />
      </div>
    </div>
  );
}
