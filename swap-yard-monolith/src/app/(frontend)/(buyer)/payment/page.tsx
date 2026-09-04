"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Check, Lock, RotateCcw, Star, ArrowLeft, CreditCard, Building, Smartphone, Loader2 } from "lucide-react";
import ValuePropsSection from "@/components/buyer/listings/ValuePropsSection";

const PAYMENT_METHODS = [
    { id: "card", name: "Credit / Debit Card", icon: <CreditCard className="w-5 h-5 text-gray-600" /> },
    { id: "paystack", name: "Paystack (Naira)", icon: <Smartphone className="w-5 h-5 text-gray-600" /> },
    { id: "transfer", name: "Bank Transfer", icon: <Building className="w-5 h-5 text-gray-600" /> },
];

export default function PaymentPage() {
    const router = useRouter(); 
    const { cartItems, cartTotal, cartCount } = useCart();
    
    // --- State Management ---
    const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
    const [isMounted, setIsMounted] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);

    // --- Form State for Card Payment ---
    const [cardData, setCardData] = useState({
        cardNumber: "",
        expiry: "",
        cvc: "",
        name: ""
    });

    // Load checkout data on mount
    useEffect(() => {
        setIsMounted(true);
        try {
            const storedCheckout = sessionStorage.getItem("swapyard_checkout");
            if (storedCheckout) {
                const parsedData = JSON.parse(storedCheckout);
                if (parsedData.deliveryMethod?.price !== undefined) {
                    setDeliveryFee(parsedData.deliveryMethod.price);
                }
            }
        } catch (error) {
            console.error("Failed to parse checkout data:", error);
        }
    }, []);

    // Format price to Naira
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
        }).format(price);
    };

    const finalTotal = cartTotal + deliveryFee;

    // Prevent hydration mismatch
    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-[#EB3B18] animate-spin" />
            </div>
        );
    }

    
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digits, limit to 16 digits
        const value = e.target.value.replace(/\D/g, "").substring(0, 16);
        // Add a space after every 4 digits
        const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
        setCardData({ ...cardData, cardNumber: formatted });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digits, limit to 4 digits
        let value = e.target.value.replace(/\D/g, "").substring(0, 4);
        // Add slash after 2nd digit
        if (value.length >= 3) {
            value = `${value.substring(0, 2)}/${value.substring(2)}`;
        }
        setCardData({ ...cardData, expiry: value });
    };

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digits, limit to 3 digits
        const value = e.target.value.replace(/\D/g, "").substring(0, 3);
        setCardData({ ...cardData, cvc: value });
    };


    // --- Handle Proceed to Review ---
    const handleNextStep = (e: React.MouseEvent) => {
        e.preventDefault();

        // Save selected payment method to storage
        const paymentData = {
            method: selectedPayment,
            // Only save card details if card is selected
            ...(selectedPayment === "card" && {
                cardNumber: cardData.cardNumber,
                name: cardData.name
            })
        };
        sessionStorage.setItem("swapyard_payment", JSON.stringify(paymentData));

        // Route to review page
        router.push("/review");
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link 
                href="/checkout" 
                aria-label="Go back to checkout"
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors cursor-pointer flex items-center px-6 pt-8 pb-10 max-w-6xl mx-auto"
            >
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                BACK TO CHECKOUT
            </Link>

            {/* MAIN CONTENT - STRICTLY FLEX-ROW */}
            <div className="max-w-6xl mx-auto mt-4 px-6 flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
                
                {/* LEFT COLUMN: Payment Details */}
                <div className="w-full lg:w-[58%] flex flex-col">
                    <div className="mb-10">
                        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">Payment method</h1>
                        <p className="text-xs text-gray-500">All transactions are secure and encrypted.</p>
                    </div>

                    {/* Payment Options */}
                    <div className="flex flex-col gap-4 mb-10">
                        {PAYMENT_METHODS.map((method) => (
                            <div 
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={`border rounded-md transition-all cursor-pointer overflow-hidden ${
                                    selectedPayment === method.id 
                                        ? "border-[#EB3B18] ring-1 ring-[#EB3B18]" 
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {/* Header Toggle */}
                                <div className={`flex items-center justify-between p-5 ${selectedPayment === method.id ? 'bg-orange-50/30' : 'bg-white'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === method.id ? 'border-[#EB3B18]' : 'border-gray-300'}`}>
                                            {selectedPayment === method.id && <div className="w-2 h-2 bg-[#EB3B18] rounded-full"></div>}
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{method.name}</span>
                                    </div>
                                    {method.icon}
                                </div>

                                {/* Expandable Card Form */}
                                {selectedPayment === "card" && method.id === "card" && (
                                    <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">CARD NUMBER</label>
                                            <input 
                                                type="text" 
                                                placeholder="0000 0000 0000 0000" 
                                                value={cardData.cardNumber}
                                                onChange={handleCardNumberChange}
                                                maxLength={19} // 16 digits + 3 spaces
                                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#EB3B18] outline-none text-sm text-gray-800 transition-colors tracking-widest" 
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">EXPIRY DATE</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="MM/YY" 
                                                    value={cardData.expiry}
                                                    onChange={handleExpiryChange}
                                                    maxLength={5} // MM/YY is 5 chars
                                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#EB3B18] outline-none text-sm text-gray-800 transition-colors" 
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">SECURITY CODE (CVC)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="123" 
                                                    value={cardData.cvc}
                                                    onChange={handleCvcChange}
                                                    maxLength={3} // Exactly 3 chars
                                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#EB3B18] outline-none text-sm text-gray-800 transition-colors" 
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">NAME ON CARD</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. James Garett" 
                                                value={cardData.name}
                                                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#EB3B18] outline-none text-sm text-gray-800 transition-colors" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Expandable Paystack Info */}
                                {selectedPayment === "paystack" && method.id === "paystack" && (
                                    <div className="p-6 bg-white border-t border-gray-100">
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <Smartphone className="w-10 h-10 text-gray-300 mb-3" />
                                            <p className="text-sm text-gray-500 max-w-xs">
                                                After clicking "Review Order", you will be redirected to Paystack to complete your purchase securely.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-auto">
                        <Link 
                            href="/checkout"
                            aria-label="Go back to checkout step"
                            className="px-6 py-2.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                        >
                            BACK
                        </Link>
                        <button 
                            onClick={handleNextStep}
                            aria-label="Review your order details"
                            className="px-6 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest bg-[#EB3B18] rounded-sm hover:bg-[#d93616] transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            REVIEW ORDER <span className="text-sm leading-none">&rsaquo;</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar (Summary & Info) */}
                <div className="w-full lg:w-[35%] max-w-[400px] flex flex-col">
                    
                    {/* Order Summary Box */}
                    <div className="bg-gray-50/50 border border-gray-100 rounded-md p-6 mb-8">
                        <h3 className="font-bold text-gray-900 mb-6">Order summary</h3>
                        
                        {/* Table Header */}
                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-200">
                            <span className="flex-1">PRODUCT</span>
                            <span className="w-12 text-center">QTY</span>
                            <span className="w-20 text-right">PRICE</span>
                        </div>

                        {/* Table Rows */}
                        <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-200">
                            {cartItems.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4">No items in cart</p>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start w-full">
                                        <div className="flex flex-1 gap-3 pr-2">
                                            <div className="w-12 h-12 bg-gray-200 shrink-0 relative overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover absolute inset-0" />
                                            </div>
                                            <div className="flex flex-col pt-0.5">
                                                <span className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{item.title}</span>
                                                <span className="text-xs text-gray-500 uppercase tracking">Color: <span className="font-semibold text-gray-700">N/A</span></span>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider">Size: <span className="font-semibold text-gray-700">N/A</span></span>
                                            </div>
                                        </div>
                                        <div className="w-12 text-center text-sm font-semibold text-gray-800 pt-0.5">{item.quantity}</div>
                                        <div className="w-20 text-right text-sm font-bold text-gray-900 pt-0.5">{formatPrice(item.price)}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Subtotals */}
                        <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">Subtotal ({cartCount} items)</span>
                                <span className="text-sm font-bold text-gray-900">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">Shipping cost</span>
                                <span className="text-sm font-bold text-gray-900">{formatPrice(deliveryFee)}</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2">
                            <span className=" font-bold text-gray-900">Total</span>
                            <span className="text-lg font-extrabold text-gray-900">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Secure, encrypted payment processing</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <RotateCcw className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Easy returns within 14 days</span>
                        </div>
                    </div>
                </div>
            </div>

            <ValuePropsSection />
        </div>
    );
}