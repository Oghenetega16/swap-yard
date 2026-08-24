import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/token";
import { prisma } from "@/lib/prisma";

function pctChange(current: number, previous: number): { change: string; isUp: boolean } {
  if (previous === 0) {
    if (current === 0) return { change: "0%", isUp: true };
    return { change: "New", isUp: true };
  }
  const diff = ((current - previous) / previous) * 100;
  const isUp = diff >= 0;
  return { change: `${isUp ? "+ " : "- "}${Math.abs(diff).toFixed(1)}%`, isUp };
}

export async function GET() {
  try {
    const token = (await cookies()).get("session")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const userId = typeof payload === "string" ? payload : payload?.userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);

    const last30Start = new Date(now);
    last30Start.setUTCDate(last30Start.getUTCDate() - 30);

    const prev30Start = new Date(now);
    prev30Start.setUTCDate(prev30Start.getUTCDate() - 60);

    const CHART_DAYS = 14;
    const chartStart = new Date(todayStart);
    chartStart.setUTCDate(chartStart.getUTCDate() - (CHART_DAYS - 1));

    const [
      totalUsers,
      usersLast30,
      usersPrev30,
      totalSellers,
      sellersLast30,
      sellersPrev30,
      activeListings,
      listingsLast30,
      listingsPrev30,
      ordersToday,
      ordersYesterday,
      revenueTodayAgg,
      revenueYesterdayAgg,
      pendingReports,
      reportsToday,
      chartUsers,
      chartOrders,
      categoryGroups,
      statusGroups,
      sellerGroups,
      recentUsers,
      recentListings,
      recentOrders,
      recentReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: last30Start } } }),
      prisma.user.count({ where: { createdAt: { gte: prev30Start, lt: last30Start } } }),
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "SELLER", createdAt: { gte: last30Start } } }),
      prisma.user.count({ where: { role: "SELLER", createdAt: { gte: prev30Start, lt: last30Start } } }),
      prisma.listing.count({ where: { status: "AVAILABLE" } }),
      prisma.listing.count({ where: { status: "AVAILABLE", createdAt: { gte: last30Start } } }),
      prisma.listing.count({ where: { status: "AVAILABLE", createdAt: { gte: prev30Start, lt: last30Start } } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: todayStart }, payment: { status: "SUCCESS" } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: yesterdayStart, lt: todayStart }, payment: { status: "SUCCESS" } },
      }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.report.count({ where: { status: "OPEN", createdAt: { gte: todayStart } } }),
      prisma.user.findMany({
        where: { createdAt: { gte: chartStart } },
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: chartStart } },
        select: { createdAt: true },
      }),
      prisma.listing.groupBy({
        by: ["categoryId"],
        where: { categoryId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { categoryId: "desc" } },
        take: 5,
      }),
      prisma.listing.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.listing.groupBy({
        by: ["sellerId"],
        _count: { _all: true },
        orderBy: { _count: { sellerId: "desc" } },
        take: 4,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, firstname: true, lastname: true, role: true, createdAt: true },
      }),
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true,
          seller: { select: { username: true, firstname: true, lastname: true } },
        },
      }),
      prisma.order.findMany({
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, updatedAt: true },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, type: true, createdAt: true },
      }),
    ]);

    // --- Category names for the top-categories bar list ---
    const categoryIds = categoryGroups.map((g) => g.categoryId).filter(Boolean) as string[];
    const categories = categoryIds.length
      ? await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
      : [];
    const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));

    // --- Seller names for the top-sellers list ---
    const sellerIds = sellerGroups.map((g) => g.sellerId);
    const sellerUsers = sellerIds.length
      ? await prisma.user.findMany({
          where: { id: { in: sellerIds } },
          select: { id: true, firstname: true, lastname: true, username: true },
        })
      : [];
    const sellerNameMap = new Map(
      sellerUsers.map((s) => [
        s.id,
        [s.firstname, s.lastname].filter(Boolean).join(" ") || s.username || "Unnamed seller",
      ])
    );

    // --- Bucket users/orders into daily counts for the line chart ---
    const dayKeys: string[] = [];
    const dayLabels: string[] = [];
    for (let i = CHART_DAYS - 1; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setUTCDate(d.getUTCDate() - i);
      dayKeys.push(d.toISOString().slice(0, 10));
      dayLabels.push(d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }));
    }
    const userCounts: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
    const orderCounts: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
    for (const u of chartUsers) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (key in userCounts) userCounts[key]++;
    }
    for (const o of chartOrders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (key in orderCounts) orderCounts[key]++;
    }
    const chartData = dayKeys.map((key, i) => ({
      name: dayLabels[i],
      users: userCounts[key],
      orders: orderCounts[key],
    }));

    const revenueToday = revenueTodayAgg._sum.totalAmount ?? 0;
    const revenueYesterday = revenueYesterdayAgg._sum.totalAmount ?? 0;

    const metrics = [
      {
        key: "totalUsers",
        title: "Total Users",
        value: totalUsers,
        sub: "vs last 30 days",
        ...pctChange(usersLast30, usersPrev30),
      },
      {
        key: "totalSellers",
        title: "Total Sellers",
        value: totalSellers,
        sub: "vs last 30 days",
        ...pctChange(sellersLast30, sellersPrev30),
      },
      {
        key: "activeListings",
        title: "Active Listings",
        value: activeListings,
        sub: "vs last 30 days",
        ...pctChange(listingsLast30, listingsPrev30),
      },
      {
        key: "ordersToday",
        title: "Orders (Today)",
        value: ordersToday,
        sub: "vs yesterday",
        ...pctChange(ordersToday, ordersYesterday),
      },
      {
        key: "revenueToday",
        title: "Revenue (Today)",
        value: revenueToday,
        isCurrency: true,
        sub: "vs yesterday",
        ...pctChange(revenueToday, revenueYesterday),
      },
      {
        key: "pendingReports",
        title: "Pending reports",
        value: pendingReports,
        change: `${reportsToday} new report${reportsToday === 1 ? "" : "s"}`,
        isUp: false,
        sub: "",
      },
    ];

    const categoryData = categoryGroups.map((g) => ({
      name: g.categoryId ? categoryNameMap.get(g.categoryId) ?? "Uncategorized" : "Uncategorized",
      value: g._count._all,
    }));

    // ProductStatus only has AVAILABLE / SOLD in your schema — the mock's
    // Pending/Rejected slices don't correspond to real data, so they're dropped.
    const STATUS_LABELS: Record<string, string> = { AVAILABLE: "Available", SOLD: "Sold" };
    const STATUS_COLORS: Record<string, string> = { AVAILABLE: "#10B981", SOLD: "#3B82F6" };
    const pieData = statusGroups.map((g) => ({
      name: STATUS_LABELS[g.status] ?? g.status,
      value: g._count._all,
      color: STATUS_COLORS[g.status] ?? "#94A3B8",
    }));

    const topSellers = sellerGroups.map((g) => ({
      name: sellerNameMap.get(g.sellerId) ?? "Unknown seller",
      listingCount: g._count._all,
    }));

    const activity = [
      ...recentUsers.map((u) => ({
        type: "user" as const,
        label: "New user registered",
        desc: `${[u.firstname, u.lastname].filter(Boolean).join(" ") || "A user"} joined as a ${u.role.toLowerCase()}`,
        createdAt: u.createdAt,
      })),
      ...recentListings.map((l) => ({
        type: "listing" as const,
        label: "New listing created",
        desc: `${l.name} by ${
  l.seller.username ??
  ([l.seller.firstname, l.seller.lastname].filter(Boolean).join(" ") || "a seller")
}`,
        createdAt: l.createdAt,
      })),
      ...recentOrders.map((o) => ({
        type: "order" as const,
        label: "Order completed",
        desc: `Order #${o.id.slice(0, 8).toUpperCase()} completed`,
        createdAt: o.updatedAt,
      })),
      ...recentReports.map((r) => ({
        type: "report" as const,
        label: "New report received",
        desc: `${r.type} report filed`,
        createdAt: r.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }));

    return NextResponse.json(
      { ok: true, metrics, chartData, categoryData, pieData, topSellers, activity },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}