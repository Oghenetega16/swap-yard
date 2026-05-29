"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage() {
    const { clearCart } = useCart();
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        setOrderId(`SY-${Math.floor(100000 + Math.random() * 900000)}`);
        
        clearCart();
    }, []);

    return (
        <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center px-4 py-16">
            <div className="max-w-lg w-full text-center">
                
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-70"></div>
                    <div className="relative bg-green-50 rounded-full w-full h-full flex items-center justify-center border-4 border-green-500">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                    Payment Successful!
                </h1>
                
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Thank you for your purchase. We've received your order and will begin processing it right away. A confirmation email has been sent to you.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10 flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Order Reference</p>
                    <p className="text-2xl font-black text-[#EB3B18] tracking-widest">{orderId}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href="/orders" 
                        className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-widest border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Package className="w-4 h-4" /> View Order
                    </Link>
                    <Link 
                        href="/listings" 
                        className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-white uppercase tracking-widest bg-[#EB3B18] rounded-sm hover:bg-[#d93616] transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
    );
}