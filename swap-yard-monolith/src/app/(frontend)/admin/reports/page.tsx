"use client";

import { useState } from "react";
import { Search, ChevronDown, Save, X, Eye } from "lucide-react";
import { useAdminReports, type ReportStatus } from "@/hooks/admin/useAdminReports";

const ALL_STATUSES: ReportStatus[] = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];

export default function AdminReports() {
    const { state, setters, handlers } = useAdminReports();
    const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
    const [detailPendingStatus, setDetailPendingStatus] = useState<string | null>(null);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return "text-[#2ECC71] border-[#2ECC71] bg-green-50";
            case "UNDER_REVIEW":
                return "text-[#3498DB] border-[#3498DB] bg-blue-50";
            case "OPEN":
                return "text-[#F1C40F] border-[#F1C40F] bg-yellow-50";
            case "REJECTED":
                return "text-[#E74C3C] border-[#E74C3C] bg-red-50";
            default:
                return "text-gray-500 border-gray-200 bg-gray-50";
        }
    };

    const formatStatusText = (status: string) =>
        status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    if (state.isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002147]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 relative">

            {state.error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium" role="alert">
                    {state.error}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="relative w-full max-w-2xl">
                    <input
                        type="text"
                        placeholder="Search by Reporter, Listing, Type, or Reason"
                        value={state.searchQuery}
                        onChange={(e) => setters.setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#002147]"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <label htmlFor="statusFilter" className="text-sm text-gray-700 font-medium">Status:</label>
                    <div className="relative">
                        <select
                            id="statusFilter"
                            value={state.statusFilter}
                            onChange={(e) => setters.setStatusFilter(e.target.value as ReportStatus | "ALL")}
                            className="appearance-none bg-[#EB3B18] text-white text-sm font-medium px-4 py-2 pr-10 rounded-lg cursor-pointer focus:outline-none shadow-sm"
                        >
                            <option value="ALL">All</option>
                            {ALL_STATUSES.map((s) => (
                                <option key={s} value={s}>{formatStatusText(s)}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-240">
                    <thead>
                        <tr className="bg-[#002147] text-white text-sm">
                            <th className="px-4 py-4 rounded-tl-lg font-medium whitespace-nowrap">Report ID</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Reporter</th>
                            <th className="px-4 py-4 font-medium min-w-40">Listing</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Type</th>
                            <th className="px-4 py-4 font-medium min-w-50">Reason</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Reported On</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Status</th>
                            <th className="px-4 py-4 rounded-tr-lg font-medium whitespace-nowrap text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                        {state.reports.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                    No reports found matching your search.
                                </td>
                            </tr>
                        ) : (
                            state.reports.map((report) => {
                                const isUpdating = state.isUpdating === report.id;
                                const selected = pendingStatus[report.id] ?? report.status;
                                const hasChange = selected !== report.status;

                                return (
                                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-5 font-mono text-xs text-gray-500">
                                            #{report.id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-5 font-medium">{report.reporterName}</td>
                                        <td className="px-4 py-5">{report.listingName}</td>
                                        <td className="px-4 py-5 capitalize">{report.type.toLowerCase()}</td>
                                        <td className="px-4 py-5 max-w-xs truncate" title={report.reason}>{report.reason}</td>
                                        <td className="px-4 py-5 whitespace-nowrap text-gray-500">{formatDate(report.createdAt)}</td>
                                        <td className="px-4 py-5">
                                            <span className={`px-3 py-1.5 rounded-md border text-xs font-bold whitespace-nowrap ${getStatusStyle(report.status)}`}>
                                                {formatStatusText(report.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlers.viewReport(report.id)}
                                                    className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                                <div className="relative">
                                                    <select
                                                        value={selected}
                                                        onChange={(e) =>
                                                            setPendingStatus((prev) => ({ ...prev, [report.id]: e.target.value }))
                                                        }
                                                        disabled={isUpdating}
                                                        className="appearance-none bg-white border border-gray-300 text-xs font-medium text-gray-800 pl-3 pr-8 py-1.5 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#002147] disabled:opacity-50"
                                                    >
                                                        {ALL_STATUSES.map((s) => (
                                                            <option key={s} value={s}>{formatStatusText(s)}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                </div>
                                                <button
                                                    onClick={() => handlers.updateReportStatus(report.id, selected as ReportStatus)}
                                                    disabled={isUpdating || !hasChange}
                                                    className="inline-flex items-center gap-1.5 bg-[#002147] hover:bg-[#001733] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                                                >
                                                    {isUpdating ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Save size={14} />
                                                    )}
                                                    Update
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail panel */}
            {(state.selectedReport || state.isLoadingDetail || state.detailError) && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="font-extrabold text-gray-900 text-lg">Report Details</h3>
                            <button
                                onClick={() => {
                                    handlers.closeReport();
                                    setDetailPendingStatus(null);
                                }}
                                className="text-gray-500 hover:text-gray-900 p-1 cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-sm">
                            {state.isLoadingDetail && (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002147]" />
                                </div>
                            )}

                            {state.detailError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{state.detailError}</div>
                            )}

                            {state.selectedReport && !state.isLoadingDetail && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Reporter</p>
                                            <p className="font-medium text-gray-900">{state.selectedReport.reporterName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Listing</p>
                                            <p className="font-medium text-gray-900">{state.selectedReport.listingName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Type</p>
                                            <p className="font-medium text-gray-900 capitalize">{state.selectedReport.type.toLowerCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Reported On</p>
                                            <p className="font-medium text-gray-900">{formatDate(state.selectedReport.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Reason</p>
                                        <p className="text-gray-800">{state.selectedReport.reason}</p>
                                    </div>

                                    {state.selectedReport.comment && (
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Comment</p>
                                            <p className="text-gray-800">{state.selectedReport.comment}</p>
                                        </div>
                                    )}

                                    {state.selectedReport.images.length > 0 && (
                                        <div>
                                            <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Attached Images</p>
                                            <div className="flex gap-3">
                                                {state.selectedReport.images.map((url) => (
                                                    <a key={url} href={url} target="_blank" rel="noreferrer">
                                                        <img src={url} alt="Report evidence" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Update Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <select
                                                    value={detailPendingStatus ?? state.selectedReport.status}
                                                    onChange={(e) => setDetailPendingStatus(e.target.value)}
                                                    disabled={state.isUpdating === state.selectedReport.id}
                                                    className="w-full appearance-none bg-white border border-gray-300 text-sm font-medium text-gray-800 pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#002147] disabled:opacity-50"
                                                >
                                                    {ALL_STATUSES.map((s) => (
                                                        <option key={s} value={s}>{formatStatusText(s)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const next = (detailPendingStatus ?? state.selectedReport!.status) as ReportStatus;
                                                    handlers.updateReportStatus(state.selectedReport!.id, next);
                                                }}
                                                disabled={
                                                    state.isUpdating === state.selectedReport.id ||
                                                    (detailPendingStatus ?? state.selectedReport.status) === state.selectedReport.status
                                                }
                                                className="inline-flex items-center gap-1.5 bg-[#002147] hover:bg-[#001733] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 cursor-pointer"
                                            >
                                                {state.isUpdating === state.selectedReport.id ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Save size={14} />
                                                )}
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}