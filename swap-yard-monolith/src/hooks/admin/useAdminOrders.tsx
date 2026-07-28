"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrderStatus =
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

interface AdminOrderRow {
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

interface RawOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  buyer?: { firstname?: string; lastname?: string; email?: string } | null;
  items: Array<{
    condition?: string;
    price?: number;
    listing?: { name?: string; price?: number } | null;
    seller?: { firstname?: string; lastname?: string; email?: string } | null;
  }>;
}

function fullName(p?: { firstname?: string; lastname?: string; email?: string } | null) {
  if (!p) return "—";
  const name = [p.firstname, p.lastname].filter(Boolean).join(" ").trim();
  return name || p.email || "—";
}

function mapOrder(order: RawOrder): AdminOrderRow {
  const firstItem = order.items?.[0];
  // Multiple sellers on one order are unusual but possible — join them so nothing is hidden.
  const sellerNames = Array.from(
    new Set((order.items ?? []).map((i) => fullName(i.seller)).filter(Boolean))
  ).join(", ");

  return {
    id: order.id,
    rawOrderId: order.id,
    displayOrderId: `#${order.id.slice(-8).toUpperCase()}`,
    buyerName: fullName(order.buyer),
    sellerName: sellerNames || "—",
    itemName: firstItem?.listing?.name ?? "—",
    condition: firstItem?.condition ?? "—",
    price: firstItem?.price ?? firstItem?.listing?.price ?? 0,
    status: order.status,
    createdAt: order.createdAt,
  };
}

export function useAdminOrders() {
  const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest">("Newest");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders?limit=100", {
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
    async (rawOrderId: string, newStatus: OrderStatus) => {
      setIsUpdating(rawOrderId);
      setError(null);
      try {
        const res = await fetch(`/api/admin/orders/${rawOrderId}`, {
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
          prev.map((o) => (o.id === rawOrderId ? { ...o, status: newStatus } : o))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update order");
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const orders = useMemo(() => {
    const mapped = rawOrders.map(mapOrder);

    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? mapped.filter(
          (o) =>
            o.itemName.toLowerCase().includes(q) ||
            o.buyerName.toLowerCase().includes(q) ||
            o.sellerName.toLowerCase().includes(q) ||
            o.displayOrderId.toLowerCase().includes(q) ||
            o.rawOrderId.toLowerCase().includes(q)
        )
      : mapped;

    const sorted = [...filtered].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortBy === "Newest" ? -diff : diff;
    });

    return sorted;
  }, [rawOrders, searchQuery, sortBy]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  return {
    state: { orders, isLoading, error, searchQuery, sortBy, isUpdating },
    setters: { setSearchQuery, setSortBy },
    handlers: { updateOrderStatus, refetch: fetchOrders },
    helpers: { formatPrice },
  };
}