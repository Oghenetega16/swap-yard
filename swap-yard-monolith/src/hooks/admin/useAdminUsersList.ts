"use client";

import { useCallback, useEffect, useState } from "react";

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

interface AdminUserRow {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  email: string;
  role: UserRole;
  phoneNumber: string | null;
  state: string | null;
  emailVerified: string | null;
  createdAt: string;
  _count: {
    listings: number;
    receivedReviews: number;
    buyerOrders: number;
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function fetchCount(params: URLSearchParams) {
  const res = await fetch(`/api/admin/users?${params.toString()}`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Failed to load count");
  return data.meta.total as number;
}

export function useAdminUsersList() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [counts, setCounts] = useState<{ total: number; buyers: number; sellers: number } | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search.trim()) params.set("search", search.trim());
      if (role !== "ALL") params.set("role", role);

      const res = await fetch(`/api/admin/users?${params.toString()}`, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message ?? "Failed to load users");

      setUsers(data.items ?? []);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [search, role, page]);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [total, buyers, sellers] = await Promise.all([
          fetchCount(new URLSearchParams({ limit: "1" })),
          fetchCount(new URLSearchParams({ limit: "1", role: "BUYER" })),
          fetchCount(new URLSearchParams({ limit: "1", role: "SELLER" })),
        ]);
        setCounts({ total, buyers, sellers });
      } catch {
        // Summary cards are non-critical — fail silently and leave them blank.
      }
    }
    loadCounts();
  }, []);

  return {
    state: { users, meta, isLoading, error, search, role, page, counts },
    setters: { setSearch, setRole, setPage },
    handlers: { refetch: fetchUsers },
  };
}