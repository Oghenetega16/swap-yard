"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Search,
    ChevronDown,
    Clock,
    Truck,
    CheckCircle2,
    Loader2,
    Phone,
    Lock,
    PackageCheck,
} from "lucide-react";


type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "BUYER_CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED"
    | "DISPUTED";

interface OrderItem {
    listingName: string;
    unitPrice: number;
    quantity: number;
    listing: {
        images: { url: string }[];
    };
    seller: {
        firstname: string;
        phoneNumber?: string;
    };
}

interface Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
}


const PAID_STATUSES: OrderStatus[] = [
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "BUYER_CONFIRMED",
    "COMPLETED",
];

const isPaid = (status: OrderStatus) => PAID_STATUSES.includes(status);

const getProgress = (status: OrderStatus): 1 | 2 | 3 => {
    if (status === "SHIPPED") return 2;
    if (["DELIVERED", "BUYER_CONFIRMED", "COMPLETED"].includes(status)) return 3;
    return 1;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "Pending payment",
    PAID: "Paid",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    BUYER_CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    DISPUTED: "Disputed",
};

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "bg-orange-50 text-orange-700 ring-orange-200",
    PAID: "bg-green-50 text-green-700 ring-green-200",
    PROCESSING: "bg-orange-50 text-orange-700 ring-orange-200",
    SHIPPED: "bg-blue-50 text-blue-700 ring-blue-200",
    DELIVERED: "bg-teal-50 text-teal-700 ring-teal-200",
    BUYER_CONFIRMED: "bg-teal-50 text-teal-700 ring-teal-200",
    COMPLETED: "bg-teal-50 text-teal-700 ring-teal-200",
    CANCELLED: "bg-gray-100 text-gray-500 ring-gray-200",
    REFUNDED: "bg-gray-100 text-gray-500 ring-gray-200",
    DISPUTED: "bg-red-50 text-red-700 ring-red-200",
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
    }).format(price);


type StepState = "inactive" | "done" | "active";

interface ProgressStepProps {
    icon: React.ReactNode;
    label: string;
    state: StepState;
    activeColor: "orange" | "green" | "blue";
    isLast?: boolean;
}

const ACTIVE_STYLES = {
    orange: "bg-orange-500 text-white ring-4 ring-orange-100",
    green: "bg-green-500 text-white ring-4 ring-green-100",
    blue: "bg-blue-500 text-white ring-4 ring-blue-100",
};

const DONE_STYLES = {
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
};

function ProgressStep({ icon, label, state, activeColor, isLast }: ProgressStepProps) {
    const dotClass =
        state === "active"
            ? ACTIVE_STYLES[activeColor]
            : state === "done"
            ? DONE_STYLES[activeColor]
            : "bg-gray-100 text-gray-400";

    const labelClass =
        state === "active"
            ? "font-semibold text-gray-900"
            : state === "done"
            ? "text-gray-500"
            : "text-gray-400";

    return (
        <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative flex items-center w-full">
                <div
                    className={`flex-1 h-px ${
                        state === "done" || state === "active" ? "bg-green-200" : "bg-gray-200"
                    }`}
                />
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${dotClass}`}
                >
                    {icon}
                </div>
                {isLast ? (
                    <div className="flex-1" />
                ) : (
                    <div className="flex-1 h-px bg-gray-200" />
                )}
            </div>
            <span className={`text-[10px] uppercase tracking-wide ${labelClass}`}>{label}</span>
        </div>
    );
}


function ConfirmDeliveryButton({ orderId, onConfirmed }: { orderId: string; onConfirmed: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/orders/${orderId}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "BUYER_CONFIRMED" }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data.message || "Failed to confirm delivery.");
            }
            onConfirmed();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <PackageCheck className="w-4 h-4" />
                )}
                {loading ? "Confirming…" : "I've received this order"}
            </button>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
    );
}


function OrderCard({ order, onStatusUpdate }: { order: Order; onStatusUpdate: (id: string, status: OrderStatus) => void }) {
    const progress = getProgress(order.status);
    const contactUnlocked = isPaid(order.status);
    const seller = order.items[0]?.seller;
    const isDelivered = order.status === "DELIVERED";
    const isConfirmed = ["BUYER_CONFIRMED", "COMPLETED"].includes(order.status);

    const handlePay = async () => {
    const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    if (data.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl; 
    }
};

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-xs font-mono font-medium text-gray-500">
                    #{order.id.slice(-8).toUpperCase()}
                </span>
                <span
                    className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ring-1 ${
                        STATUS_BADGE_CLASS[order.status] ?? "bg-gray-100 text-gray-500 ring-gray-200"
                    }`}
                >
                    {STATUS_LABEL[order.status] ?? order.status}
                </span>
            </div>

            <div className="p-5 flex flex-col gap-5">

                <div className="flex flex-col gap-3">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <img
                                src={item.listing?.images[0]?.url || "https://placehold.co/96x96/f5f5f5/aaa?text=Item"}
                                alt={item.listingName}
                                className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0 bg-gray-50"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.listingName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Sold by {item.seller?.firstname} · Qty {item.quantity}
                                </p>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 shrink-0">
                                {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Order total</span>
                    <span className="text-base font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>

                <div className="flex items-start w-full">
                    <ProgressStep
                        icon={<Clock size={15} />}
                        label="Ordered"
                        state={progress >= 1 ? (progress > 1 ? "done" : "active") : "inactive"}
                        activeColor="orange"
                    />
                    <ProgressStep
                        icon={<Truck size={15} />}
                        label="Shipped"
                        state={progress >= 2 ? (progress > 2 ? "done" : "active") : "inactive"}
                        activeColor="green"
                    />
                    <ProgressStep
                        icon={<CheckCircle2 size={15} />}
                        label="Delivered"
                        state={progress >= 3 ? "active" : "inactive"}
                        activeColor="blue"
                        isLast
                    />
                </div>

                {contactUnlocked && seller ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                Seller contact
                            </span>
                            <span className="text-sm font-semibold text-gray-800">{seller.firstname}</span>
                            {seller.phoneNumber && (
                                <span className="text-xs text-gray-500">{seller.phoneNumber}</span>
                            )}
                        </div>
                        {seller.phoneNumber && (
                            <a
                                href={`tel:${seller.phoneNumber}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-xs font-semibold transition-all"
                            >
                                <Phone size={13} />
                                Call seller
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                        <Lock size={14} className="text-orange-400 shrink-0" />
                        <p className="text-xs text-orange-700 flex-1">
                            Complete your payment to unlock the seller's contact number.
                        </p>
                        {order.status === "PENDING_PAYMENT" && (
                            <button
                                onClick={handlePay}
                                className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                                Pay now
                            </button>
                        )}
                    </div>
                )}
                {isDelivered && !isConfirmed && (
                    <ConfirmDeliveryButton
                        orderId={order.id}
                        onConfirmed={() => onStatusUpdate(order.id, "BUYER_CONFIRMED")}
                    />
                )}

                {isConfirmed && (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-50 border border-teal-100">
                        <CheckCircle2 size={14} className="text-teal-500" />
                        <span className="text-xs font-semibold text-teal-600">Delivery confirmed — thank you!</span>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/orders?scope=buyer&limit=50");
                const data = await res.json();
                if (data.ok) setOrders(data.items);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const title = order.items[0]?.listingName ?? "";
            const matchesSearch =
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === "All" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter, orders]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-3 md:ml-64">
                    <Loader2 className="w-10 h-10 text-[#EB3B18] animate-spin" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                        Loading your orders
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-12 max-w-3xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Orders
                    <span className="text-sm font-medium text-gray-400">
                        ({filteredOrders.length})
                    </span>
                </h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full md:w-[420px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by order ID or item name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EB3B18] focus:ring-1 focus:ring-[#EB3B18] transition-all"
                    />
                </div>

                <div className="relative">
                    <select
                        aria-label="Filter by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus:border-[#EB3B18]"
                    >
                        <option value="All">All statuses</option>
                        <option value="PENDING_PAYMENT">Pending payment</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-5">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium text-sm">No orders found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}