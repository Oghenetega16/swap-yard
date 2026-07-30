"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

interface RawReport {
  id: string;
  reporterId: string;
  listingId: string;
  type: string;
  reason: string;
  comment: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter?: { id: string; firstname?: string; lastname?: string } | null;
  listing?: { id: string; name?: string; slug?: string } | null;
}

export interface AdminReportRow {
  id: string;
  reporterName: string;
  listingName: string;
  listingSlug: string;
  type: string;
  reason: string;
  comment: string | null;
  images: string[];
  status: ReportStatus;
  createdAt: string;
}

function fullName(p?: { firstname?: string; lastname?: string } | null) {
  if (!p) return "—";
  return [p.firstname, p.lastname].filter(Boolean).join(" ").trim() || "—";
}

function mapReport(r: RawReport): AdminReportRow {
  return {
    id: r.id,
    reporterName: fullName(r.reporter),
    listingName: r.listing?.name ?? "—",
    listingSlug: r.listing?.slug ?? "",
    type: r.type,
    reason: r.reason,
    comment: r.comment,
    images: [r.imageUrl1, r.imageUrl2].filter(Boolean) as string[],
    status: r.status,
    createdAt: r.createdAt,
  };
}

export function useAdminReports() {
  const [rawReports, setRawReports] = useState<RawReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<AdminReportRow | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/reports?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to load reports");
      }

      setRawReports(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateReportStatus = useCallback(
    async (reportId: string, newStatus: ReportStatus) => {
      setIsUpdating(reportId);
      setError(null);
      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message ?? "Failed to update report");
        }

        setRawReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );

        setSelectedReport((prev) =>
          prev && prev.id === reportId ? { ...prev, status: newStatus } : prev
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update report");
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const viewReport = useCallback(async (reportId: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to load report");
      }

      setSelectedReport(mapReport(data.report));
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const closeReport = useCallback(() => {
    setSelectedReport(null);
    setDetailError(null);
  }, []);

  const reports = useMemo(() => {
    const mapped = rawReports.map(mapReport);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return mapped;

    return mapped.filter(
      (r) =>
        r.reporterName.toLowerCase().includes(q) ||
        r.listingName.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [rawReports, searchQuery]);

  return {
    state: {
      reports,
      isLoading,
      error,
      searchQuery,
      statusFilter,
      isUpdating,
      selectedReport,
      isLoadingDetail,
      detailError,
    },
    setters: { setSearchQuery, setStatusFilter },
    handlers: { updateReportStatus, viewReport, closeReport, refetch: fetchReports },
  };
}