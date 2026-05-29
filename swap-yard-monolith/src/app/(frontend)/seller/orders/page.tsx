"use client";

import { Search, ChevronDown, Truck } from "lucide-react";
import { useSellerOrders } from "@/hooks/seller/useSellerOrders";

export default function SellerOrders() {
    const { state, setters, handlers, helpers } = useSellerOrders();

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
                        placeholder="Search by Item, Buyer, or Order ID"
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
                            onChange={(e) => setters.setSortBy(e.target.value)}
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
                <table className="w-full text-left border-collapse min-w-200">
                    <thead>
                        <tr className="bg-[#002147] text-white text-sm">
                            <th className="px-4 py-4 rounded-tl-lg font-medium whitespace-nowrap">Order ID</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Buyer</th>
                            <th className="px-4 py-4 font-medium min-w-50">Item</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Condition</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Price</th>
                            <th className="px-4 py-4 font-medium whitespace-nowrap">Status</th>
                            <th className="px-4 py-4 rounded-tr-lg font-medium whitespace-nowrap text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                        {state.orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No orders found matching your search.
                                </td>
                            </tr>
                        ) : (
                            state.orders.map((order) => {
                                // PAID → seller marks as Shipped
                                const canShip = order.status === "PAID";
                                // SHIPPED → seller marks as Delivered
                                const canDeliver = order.status === "SHIPPED";
                                const isUpdating = state.isUpdating === order.rawOrderId;

                                return (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-5 font-mono text-xs text-gray-500">{order.displayOrderId}</td>
                                        <td className="px-4 py-5 font-medium">{order.buyerName}</td>
                                        <td className="px-4 py-5">{order.itemName}</td>
                                        <td className="px-4 py-5 capitalize">{order.condition.toLowerCase()}</td>
                                        <td className="px-4 py-5 font-bold">{helpers.formatPrice(order.price)}</td>
                                        <td className="px-4 py-5">
                                            <span className={`px-3 py-1.5 rounded-md border text-xs font-bold whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                                {formatStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            {canShip && (
                                                <button
                                                    onClick={() => handlers.updateOrderStatus(order.rawOrderId, "SHIPPED")}
                                                    disabled={isUpdating}
                                                    className="inline-flex items-center gap-1.5 bg-[#F1C40F] hover:bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isUpdating ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Truck size={14} />
                                                    )}
                                                    Mark Shipped
                                                </button>
                                            )}
                                            {canDeliver && (
                                                <button
                                                    onClick={() => handlers.updateOrderStatus(order.rawOrderId, "DELIVERED")}
                                                    disabled={isUpdating}
                                                    className="inline-flex items-center gap-1.5 bg-[#002147] hover:bg-[#001733] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isUpdating ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Truck size={14} />
                                                    )}
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}