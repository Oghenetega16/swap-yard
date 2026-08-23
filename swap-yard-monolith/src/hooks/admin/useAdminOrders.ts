"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "BUYER_CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "DISPUTED";

type SortOption = "Newest" | "Oldest";

interface RawOrderItem {
  id: string;
  price?: number | null;
  quantity?: number | null;
  listing?: {
    id: string;
    name?: string;
    price?: number;
    condition?: string;
    status?: string;
  } | null;
  seller?: { id: string; firstname?: string; lastname?: string } | null;
}

interface RawOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  buyer?: { id: string; firstname?: string; lastname?: string } | null;
  items: RawOrderItem[];
}

export interface AdminOrderRow {
  id: string;
  rawOrderId: string;
  displayOrderId: string;
  buyerName: string;
  sellerName: string;
  itemName: string;
  condition: string;
  price: number;
  status: OrderStatus;
  createdAt: string;
}

function fullName(p?: { firstname?: string; lastname?: string } | null) {
  if (!p) return "—";
  return [p.firstname, p.lastname].filter(Boolean).join(" ").trim() || "—";
}

// Orders are multi-item (multi-seller carts), so each order is expanded
// into one row per item. The order-level status/id drive updates; the
// item-level fields (seller, listing, price, condition) are per-row.
function mapOrderToRows(o: RawOrder): AdminOrderRow[] {
  const displayOrderId = o.id.slice(0, 8).toUpperCase();
  const buyerName = fullName(o.buyer);

  if (!o.items || o.items.length === 0) {
    return [
      {
        id: o.id,
        rawOrderId: o.id,
        displayOrderId,
        buyerName,
        sellerName: "—",
        itemName: "—",
        condition: "—",
        price: 0,
        status: o.status,
        createdAt: o.createdAt,
      },
    ];
  }

  return o.items.map((item) => ({
    id: `${o.id}-${item.id}`,
    rawOrderId: o.id,
    displayOrderId,
    buyerName,
    sellerName: fullName(item.seller),
    itemName: item.listing?.name ?? "—",
    condition: item.listing?.condition ?? "—",
    price: item.price ?? item.listing?.price ?? 0,
    status: o.status,
    createdAt: o.createdAt,
  }));
}

export function useAdminOrders() {
  const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?limit=50`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to load orders");
      }

      setRawOrders(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      setIsUpdating(orderId);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message ?? "Failed to update order");
        }

        setRawOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        // Note: since the table shows one row per item, this single update
        // covers every row sharing this rawOrderId (they all read o.status
        // from the same parent order).
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update order");
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const orders = useMemo(() => {
    let mapped = rawOrders.flatMap(mapOrderToRows);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      mapped = mapped.filter(
        (o) =>
          o.buyerName.toLowerCase().includes(q) ||
          o.sellerName.toLowerCase().includes(q) ||
          o.itemName.toLowerCase().includes(q) ||
          o.rawOrderId.toLowerCase().includes(q) ||
          o.displayOrderId.toLowerCase().includes(q)
      );
    }

    mapped = [...mapped].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortBy === "Newest" ? bTime - aTime : aTime - bTime;
    });

    return mapped;
  }, [rawOrders, searchQuery, sortBy]);

  const formatPrice = useCallback((price: number) => {
    return price / 1;
  }, []);

  return {
    state: {
      orders,
      isLoading,
      error,
      searchQuery,
      sortBy,
      isUpdating,
    },
    setters: { setSearchQuery, setSortBy },
    handlers: { updateOrderStatus, refetch: fetchOrders },
    helpers: { formatPrice },
  };
}