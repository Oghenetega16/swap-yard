"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Save } from "lucide-react";
import { useAdminOrders, AdminOrderRow } from "@/hooks/admin/useAdminOrders";

const ALL_STATUSES = [
    "PENDING_PAYMENT",
    "PROCESSING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "BUYER_CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
    "DISPUTED",
] as const;

interface GroupedRow extends AdminOrderRow {
    isGroupStart: boolean;
    groupSize: number;
    groupIndex: number;
}

// Rows arrive already grouped by order (items of the same order are
// adjacent). This walks the list once and tags each row with whether it
// starts a new order group, how many items are in that group (for
// rowSpan), and an alternating groupIndex for zebra striping.
function groupByOrder(rows: AdminOrderRow[]): GroupedRow[] {
    const result: GroupedRow[] = [];
    let groupIndex = -1;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const isGroupStart = i === 0 || rows[i - 1].rawOrderId !== row.rawOrderId;
        if (isGroupStart) groupIndex++;

        let groupSize = 1;
        if (isGroupStart) {
            let j = i + 1;
            while (j < rows.length && rows[j].rawOrderId === row.rawOrderId) {
                groupSize++;
                j++;
            }
        }

        result.push({ ...row, isGroupStart, groupSize, groupIndex });
    }

    return result;
}

interface PendingUpdate {
    rawOrderId: string;
    displayOrderId: string;
    itemCount: number;
    newStatus: string;
}

export default function AdminOrders() {
    const { state, setters, handlers, helpers } = useAdminOrders();
    const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
    const [confirmUpdate, setConfirmUpdate] = useState<PendingUpdate | null>(null);

    const groupedOrders = useMemo(() => groupByOrder(state.orders), [state.orders]);

    // How many item-rows belong to each order, used to decide whether an
    // update needs the multi-item confirmation.
    const orderItemCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const row of state.orders) {
            counts[row.rawOrderId] = (counts[row.rawOrderId] ?? 0) + 1;
        }
        return counts;
    }, [state.orders]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED':
            case 'COMPLETED':
            case 'BUYER_CONFIRMED':
                return "text-[#2ECC71] border-[#2ECC71] bg-green-50";
            case 'PAID':
                return "text-[#3498DB] border-[#3498DB] bg-blue-50";
            case 'SHIPPED':
                return "text-[#F1C40F] border-[#F1C40F] bg-yellow-50";
            case 'PENDING_PAYMENT':
            case 'PROCESSING':
                return "text-gray-600 border-gray-300 bg-gray-50";
            case 'CANCELLED':
            case 'REFUNDED':
            case 'DISPUTED':
                return "text-[#E74C3C] border-[#E74C3C] bg-red-50";
            default:
                return "text-gray-500 border-gray-200 bg-gray-50";
        }
    };

    const formatStatusText = (status: string) =>
        status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

    const handleUpdateClick = (order: GroupedRow, selected: string) => {
        const itemCount = orderItemCounts[order.rawOrderId] ?? 1;

        if (itemCount > 1) {
            setConfirmUpdate({
                rawOrderId: order.rawOrderId,
                displayOrderId: order.displayOrderId,
                itemCount,
                newStatus: selected,
            });
            return;
        }

        handlers.updateOrderStatus(order.rawOrderId, selected as any);
    };

    const confirmPendingUpdate = () => {
        if (!confirmUpdate) return;
        handlers.updateOrderStatus(confirmUpdate.rawOrderId, confirmUpdate.newStatus as any);
        setConfirmUpdate(null);
    };

    if (state.isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002147]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

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
                        placeholder="Search by Item, Buyer, Seller, or Order ID"
                        value={state.searchQuery}
                        onChange={(e) => setters.setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#002147]"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <label htmlFor="sortOrders" className="text-sm text-gray-700 font-medium">Sort by:</label>
                    <div className="relative">
                        <select
                            id="sortOrders"
                            value={state.sortBy}
                            onChange={(e) => setters.setSortBy(e.target.value as "Newest" | "Oldest")}
                            className="appearance-none bg-[#EB3B18] text-white text-sm font-medium px-4 py-2 pr-10 rounded-lg cursor-pointer focus:outline-none shadow-sm"
                        >
                            <option value="Newest">Newest</option>
                            <option value="Oldest">Oldest</option>
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
                            <th className="px-4 py-4 rounded-tl-lg font-medium whitespace-nowrap">Order ID</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Buyer</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Seller</th>
                            <th className="px-4 py-4 font-medium min-w-50">Item</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Condition</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Price</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Status</th>
                            <th className="px-4 py-4 rounded-tr-lg font-medium whitespace-nowrap text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                        {groupedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                    No orders found matching your search.
                                </td>
                            </tr>
                        ) : (
                            groupedOrders.map((order) => {
                                const isUpdating = state.isUpdating === order.rawOrderId;
                                const selected = pendingStatus[order.id] ?? order.status;
                                const hasChange = selected !== order.status;
                                const rowBg = order.groupIndex % 2 === 1 ? "bg-gray-50/60" : "";

                                return (
                                    <tr
                                        key={order.id}
                                        className={`border-b border-gray-100 hover:bg-gray-100/70 transition-colors ${rowBg} ${order.isGroupStart ? "border-t-2 border-t-gray-200" : ""
                                            }`}
                                    >
                                        {order.isGroupStart && (
                                            <>
                                                <td
                                                    rowSpan={order.groupSize}
                                                    className="px-4 py-5 font-mono text-xs text-gray-500 align-top border-r border-gray-100"
                                                >
                                                    {order.displayOrderId}
                                                    {order.groupSize > 1 && (
                                                        <span className="block mt-1 text-[10px] font-sans font-semibold text-[#002147] bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 w-fit">
                                                            {order.groupSize} items
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    rowSpan={order.groupSize}
                                                    className="px-4 py-5 font-medium align-top border-r border-gray-100"
                                                >
                                                    {order.buyerName}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-4 py-5 font-medium">{order.sellerName}</td>
                                        <td className="px-4 py-5">{order.itemName}</td>
                                        <td className="px-4 py-5 capitalize">{order.condition.toLowerCase()}</td>
                                        <td className="px-4 py-5 font-bold">{helpers.formatPrice(order.price)}</td>
                                        <td className="px-4 py-5">
                                            <span className={`px-3 py-1.5 rounded-md border text-xs font-bold whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                                {formatStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="relative">
                                                    <select
                                                        value={selected}
                                                        onChange={(e) =>
                                                            setPendingStatus((prev) => ({
                                                                ...prev,
                                                                [order.id]: e.target.value,
                                                            }))
                                                        }
                                                        disabled={isUpdating}
                                                        className="appearance-none bg-white border border-gray-300 text-xs font-medium text-gray-800 pl-3 pr-8 py-1.5 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#002147] disabled:opacity-50"
                                                    >
                                                        {ALL_STATUSES.map((s) => (
                                                            <option key={s} value={s}>
                                                                {formatStatusText(s)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                </div>
                                                <button
                                                    onClick={() => handleUpdateClick(order, selected)}
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

            {confirmUpdate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setConfirmUpdate(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-sm p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm text-gray-800">
                            Update all <span className="font-bold">{confirmUpdate.itemCount} items</span> in order{" "}
                            <span className="font-mono text-xs">{confirmUpdate.displayOrderId}</span>?
                        </p>

                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                onClick={() => setConfirmUpdate(null)}
                                className="px-4 py-2 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPendingUpdate}
                                className="px-4 py-2 rounded-md text-xs font-bold bg-[#002147] hover:bg-[#001733] text-white transition-colors cursor-pointer"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}