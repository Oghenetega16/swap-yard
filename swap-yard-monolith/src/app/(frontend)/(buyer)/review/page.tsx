"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Lock, ArrowLeft, MapPin, CreditCard, Loader2 } from "lucide-react";
import ValuePropsSection from "@/components/buyer/listings/ValuePropsSection";

const createIdempotencyKey = () => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
};

export default function ReviewOrderPage() {
    const router = useRouter();
    const { cartItems, cartTotal, cartCount, clearCart } = useCart();
    
    const [isMounted, setIsMounted] = useState(false);
    const [checkoutData, setCheckoutData] = useState<any>(null);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const idempotencyKeyRef = useRef(createIdempotencyKey());

    useEffect(() => {
        setIsMounted(true);
        try {
            const storedCheckout = sessionStorage.getItem("swapyard_checkout");
            const storedPayment = sessionStorage.getItem("swapyard_payment");

            if (storedCheckout) setCheckoutData(JSON.parse(storedCheckout));
            if (storedPayment) setPaymentData(JSON.parse(storedPayment));
        } catch (error) {
            console.error("Failed to parse checkout data:", error);
        }
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
        }).format(price);
    };

    const handleCompletePurchase = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": idempotencyKeyRef.current,
                },
                body: JSON.stringify({
                    pickupLocation: `${checkoutData?.street || 'N/A'}, ${checkoutData?.city || ''}`,
                    pickupNote: `Test Order - No Payment. Phone: ${checkoutData?.phone || 'N/A'}`
                }),
            });

            const data = await response.json();

            if (!response.ok && data.message !== "Payment initialization failed") {
                throw new Error(data.message || "Failed to create order");
            }

            clearCart();
            sessionStorage.removeItem("swapyard_checkout");
            sessionStorage.removeItem("swapyard_payment");

            router.push("/order-success");

        } catch (error: any) {
            console.error("Purchase Error:", error);
            // Rotate the key so a retry after an error gets a fresh key
            idempotencyKeyRef.current = createIdempotencyKey();
            alert(error.message || "An error occurred. Check if items are in your DB cart.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-[#EB3B18] animate-spin" />
            </div>
        );
    }

    const shippingMethod = checkoutData?.deliveryMethod || { name: "Standard Delivery", price: 0 };
    const finalTotal = cartTotal + shippingMethod.price;
    
    const paymentMethodName = paymentData?.method === "card" ? "VISA" : paymentData?.method || "Paystack";
    const paymentLast4 = paymentData?.cardNumber ? paymentData.cardNumber.slice(-4) : "****";

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link 
                href="/payment" 
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors cursor-pointer flex items-center px-6 pt-8 pb-10 max-w-6xl mx-auto"
            >
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                BACK TO PAYMENT
            </Link>

            <div className="max-w-6xl mx-auto mt-4 px-6 flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
                <div className="w-full lg:w-[58%] flex flex-col">
                    <div className="mb-10">
                        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">Review your order</h1>
                        <p className="text-xs text-gray-500">Please check your details before completing the purchase.</p>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="border border-gray-200 rounded-md p-6 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={16} className="text-[#EB3B18]" /> Shipping Address
                                </h2>
                                <Link href="/checkout" className="text-[10px] font-bold text-[#EB3B18] hover:underline cursor-pointer">EDIT</Link>
                            </div>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                {checkoutData ? (
                                    <>
                                        <p className="font-bold text-gray-800">{checkoutData.firstName} {checkoutData.lastName}</p>
                                        <p>{checkoutData.street}</p>
                                        <p>{checkoutData.city}, {checkoutData.state}</p>
                                        <p>{checkoutData.country} {checkoutData.zipCode}</p>
                                        <p>{checkoutData.phone}</p>
                                    </>
                                ) : (
                                    <p className="text-red-500 font-semibold text-xs">Missing checkout details.</p>
                                )}
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-md p-6 relative">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard size={16} className="text-[#EB3B18]" /> Payment Method
                                </h2>
                                <Link href="/payment" className="text-[10px] font-bold text-[#EB3B18] hover:underline cursor-pointer">EDIT</Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                    <span className="text-[8px] font-black italic text-blue-800">{paymentMethodName}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {paymentData?.method === "card" ? (
                                        <>Card ending in <span className="font-bold text-gray-800">{paymentLast4}</span></>
                                    ) : (
                                        <span className="font-bold text-gray-800">Test Processor</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-md p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Delivery Method</h2>
                                <Link href="/checkout" className="text-[10px] font-bold text-[#EB3B18] hover:underline cursor-pointer">EDIT</Link>
                            </div>
                            <p className="text-sm text-gray-600">{shippingMethod.name} — <span className="font-bold text-gray-800">{formatPrice(shippingMethod.price)}</span></p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-10 border-t border-gray-100 mt-10">
                        <Link 
                            href="/payment"
                            className="px-6 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest bg-[#EB3B18] rounded-sm hover:bg-[#d93616] transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <span className="text-sm leading-none">&lsaquo;</span> BACK
                        </Link>
                        
                        <button 
                            onClick={handleCompletePurchase}
                            disabled={isSubmitting || cartItems.length === 0}
                            className="px-8 py-3 text-[11px] font-extrabold text-white uppercase tracking-widest bg-[#EB3B18] rounded-sm hover:bg-[#d93616] transition-all transform hover:scale-[1.02] shadow-lg flex items-center gap-2 cursor-pointer disabled:bg-gray-400"
                        >
                            {isSubmitting ? (
                                <>PROCESSING <Loader2 size={14} className="animate-spin" /></>
                            ) : (
                                <>COMPLETE PURCHASE <span className="text-sm leading-none">&rsaquo;</span></>
                            )}
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-[35%] max-w-[400px] flex flex-col">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-md p-6 mb-8">
                        <h3 className="font-bold text-gray-900 text-sm mb-6">Order summary</h3>
                        <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-200">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-start w-full">
                                    <div className="flex flex-1 gap-3 pr-2">
                                        <div className="w-12 h-12 bg-gray-200 shrink-0 relative overflow-hidden">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover absolute inset-0" />
                                        </div>
                                        <div className="flex flex-col pt-0.5">
                                            <span className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{item.title}</span>
                                            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="w-20 text-right text-sm font-bold text-gray-900 pt-0.5">{formatPrice(item.price)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-xl font-black text-[#EB3B18]">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <ValuePropsSection />
        </div>
    );
}