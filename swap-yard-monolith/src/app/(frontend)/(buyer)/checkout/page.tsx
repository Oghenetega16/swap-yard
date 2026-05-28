"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import ValuePropsSection from "@/components/buyer/listings/ValuePropsSection";
import { useCountriesAndStates } from "@/hooks/buyer/useCountriesAndStates";

const DELIVERY_METHOD = { id: "door-step", name: "Door-step delivery", price: 5000, arrival: "Tomorrow" };

type PaystackInitResult =
    | { success: true; authorizationUrl: string; reference: string; accessCode: string }
    | { success: false; error: string };

async function initiatePaystackPayment(
    email: string,
    amountInNaira: number,
    metadata: Record<string, unknown>
): Promise<PaystackInitResult> {
    try {
        const res = await fetch("/api/paystack/initialize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, amount: amountInNaira * 100, metadata }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "Unknown error");
            return { success: false, error: `Server responded ${res.status}: ${text}` };
        }

        const data = await res.json();

        if (data?.data?.authorization_url) {
            return {
                success: true,
                authorizationUrl: data.data.authorization_url,
                reference: data.data.reference,
                accessCode: data.data.access_code,
            };
        }

        return { success: false, error: data?.message ?? "Unexpected Paystack response" };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Network error" };
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartTotal, cartCount } = useCart();

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "",
        street: "", city: "", zipCode: "", phone: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paystackWarning, setPaystackWarning] = useState<string | null>(null);

    const { countries, states, selectedCountry, setSelectedCountry, selectedState, setSelectedState, loading } =
        useCountriesAndStates("Nigeria");

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(price);

    const finalTotal = cartTotal + DELIVERY_METHOD.price;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = (): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!formData.firstName.trim()) e.firstName = "First name is required";
        if (!formData.lastName.trim()) e.lastName = "Second name is required";
        if (!formData.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email";
        if (!formData.street.trim()) e.street = "Street address is required";
        if (!formData.city.trim()) e.city = "City is required";
        if (!formData.zipCode.trim()) e.zipCode = "Zip code is required";
        if (!formData.phone.trim()) e.phone = "Phone number is required";
        if (!selectedCountry || selectedCountry === "Loading...") e.country = "Country is required";
        if (!selectedState || selectedState === "Loading..." || selectedState === "") e.state = "State is required";
        return e;
    };

    const handleNextStep = async (e: React.MouseEvent) => {
        e.preventDefault();
        setPaystackWarning(null);

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setIsSubmitting(true);

        // Persist checkout data for the review page
        const checkoutData = {
            ...formData,
            country: selectedCountry,
            state: selectedState,
            deliveryMethod: DELIVERY_METHOD,
            cartTotal,
            deliveryPrice: DELIVERY_METHOD.price,
            finalTotal,
        };
        sessionStorage.setItem("swapyard_checkout", JSON.stringify(checkoutData));

        // Attempt Paystack initialisation — failure is non-blocking
        const paystackResult = await initiatePaystackPayment(formData.email, finalTotal, {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            deliveryMethod: DELIVERY_METHOD.name,
            cartCount,
        });

        setIsSubmitting(false);

        if (paystackResult.success) {
            sessionStorage.setItem("swapyard_paystack", JSON.stringify({
                reference: paystackResult.reference,
                authorizationUrl: paystackResult.authorizationUrl,
                accessCode: paystackResult.accessCode,
            }));
            router.push("/review");
        } else {
            console.warn("[Paystack init failed]", paystackResult.error);
            setPaystackWarning(
                "We couldn't reach our payment provider right now. You can still review your order — payment can be completed on the next screen."
            );
            setTimeout(() => router.push("/review"), 3000);
        }
    };

    const inputClass = (field: string) =>
        `w-full px-4 py-3 bg-gray-50/50 border ${errors[field] ? "border-red-500" : "border-gray-200 focus:border-[#EB3B18]"} outline-none text-sm text-gray-800 transition-colors`;

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
                href="/cart"
                aria-label="Go back to shopping cart"
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors cursor-pointer flex items-center px-6 pt-8 pb-10 max-w-6xl mx-auto"
            >
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                BACK TO SHOPPING CART
            </Link>

            {paystackWarning && (
                <div className="max-w-6xl mx-auto px-6 mb-6">
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-md p-4">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800">{paystackWarning}</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto mt-4 px-6 flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">

                {/* LEFT COLUMN */}
                <div className="w-full lg:w-[58%] flex flex-col">
                    <div className="mb-10">
                        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">Delivery address</h1>
                    </div>

                    <div className="mb-10">
                        <div className="flex flex-col gap-5">

                            {/* Names */}
                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="flex-1 flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">FIRST NAME</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="James" className={inputClass("firstName")} />
                                    {errors.firstName && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.firstName}</span>}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">SECOND NAME</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Garett" className={inputClass("lastName")} />
                                    {errors.lastName && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.lastName}</span>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">EMAIL ADDRESS</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="james@example.com" className={inputClass("email")} />
                                {errors.email && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</span>}
                            </div>

                            {/* Street */}
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">STREET ADDRESS</label>
                                <input type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="Street and number" className={inputClass("street")} />
                                {errors.street && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.street}</span>}
                            </div>

                            {/* City & Zip */}
                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="flex-[2] flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">CITY</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className={inputClass("city")} />
                                    {errors.city && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.city}</span>}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">ZIP CODE</label>
                                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="00-000" className={inputClass("zipCode")} />
                                    {errors.zipCode && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.zipCode}</span>}
                                </div>
                            </div>

                            {/* Country & State */}
                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="country" className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">COUNTRY</label>
                                    <select
                                        id="country" value={selectedCountry} disabled={loading}
                                        onChange={(e) => { setSelectedCountry(e.target.value); if (errors.country) setErrors((p) => ({ ...p, country: "" })); }}
                                        className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.country ? "border-red-500" : "border-gray-200 focus:border-[#EB3B18]"} outline-none text-sm text-gray-800 transition-colors appearance-none cursor-pointer disabled:opacity-50`}
                                    >
                                        {loading ? <option>Loading...</option> : countries.map((c, i) => <option key={`${c}-${i}`} value={c}>{c}</option>)}
                                    </select>
                                    {errors.country && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.country}</span>}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="state" className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">STATE / PROVINCE</label>
                                    <select
                                        id="state" value={selectedState} disabled={loading || states.length === 0}
                                        onChange={(e) => { setSelectedState(e.target.value); if (errors.state) setErrors((p) => ({ ...p, state: "" })); }}
                                        className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.state ? "border-red-500" : "border-gray-200 focus:border-[#EB3B18]"} outline-none text-sm text-gray-800 transition-colors appearance-none cursor-pointer disabled:opacity-50`}
                                    >
                                        {loading ? <option>Loading...</option> : states.length === 0 ? <option value="">No states available</option> : states.map((s, i) => <option key={`${s}-${i}`} value={s}>{s}</option>)}
                                    </select>
                                    {errors.state && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.state}</span>}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="phone" className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-2">PHONE NUMBER</label>
                                    <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+234 800 000 0000" className={inputClass("phone")} />
                                    {errors.phone && <span className="text-red-500 text-[10px] mt-1 font-semibold">{errors.phone}</span>}
                                </div>
                                <div className="flex-1 hidden sm:block" />
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="mb-12">
                        <h2 className="text-base font-bold text-gray-900 mb-4">Billing address</h2>
                        <label aria-label="Use delivery address as billing address" className="flex items-center gap-3 cursor-pointer w-fit">
                            <div className="w-4 h-4 rounded-sm bg-[#EB3B18] flex items-center justify-center">
                                <Check size={12} strokeWidth={4} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-gray-800">Use delivery address as billing address</span>
                        </label>
                    </div>

                    {/* Delivery Method */}
                    <div className="mb-10">
                        <h2 className="text-base font-bold text-gray-900 mb-6">Delivery method</h2>
                        <div className="flex-1 p-5 border border-[#EB3B18] border-[1.5px] flex flex-col relative max-w-xs">
                            <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full border border-[#EB3B18] flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-[#EB3B18] rounded-full" />
                            </div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{DELIVERY_METHOD.name}</div>
                            <div className="text-[13px] font-bold text-gray-900 mb-6">{formatPrice(DELIVERY_METHOD.price)}</div>
                            <div className="mt-auto">
                                <div className="text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Package arrives:</div>
                                <div className="text-xs font-bold text-gray-900">{DELIVERY_METHOD.arrival}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                        <Link
                            href="/cart"
                            className="px-6 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest bg-[#EB3B18] rounded-sm hover:bg-[#d93616] transition-colors flex items-center gap-2"
                        >
                            <span className="text-sm leading-none">&lsaquo;</span> BACK
                        </Link>
                        <button
                            onClick={handleNextStep}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest bg-[#EB3B18] rounded-sm hover:bg-[#d93616] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> PROCESSING…</>
                            ) : (
                                <>REVIEW ORDER <span className="text-sm leading-none">&rsaquo;</span></>
                            )}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary */}
                <div className="w-full lg:w-[35%] max-w-[400px] flex flex-col">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-md p-6 mb-8">
                        <h3 className="font-bold text-gray-900 mb-6">Order summary</h3>

                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-200">
                            <span className="flex-1">PRODUCT</span>
                            <span className="w-12 text-center">QTY</span>
                            <span className="w-20 text-right">PRICE</span>
                        </div>

                        <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-200">
                            {cartItems.length === 0 ? (
                                <p className="text-xs text-gray-500 py-4">No items in cart</p>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start w-full">
                                        <div className="flex flex-1 gap-3 pr-2">
                                            <div className="w-12 h-12 bg-gray-200 shrink-0 relative overflow-hidden">
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover absolute inset-0" />
                                            </div>
                                            <div className="flex flex-col pt-0.5">
                                                <span className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{item.title}</span>
                                                <span className="text-xs text-gray-500 uppercase">Color: <span className="font-semibold text-gray-700">N/A</span></span>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider">Size: <span className="font-semibold text-gray-700">N/A</span></span>
                                            </div>
                                        </div>
                                        <div className="w-12 text-center text-sm font-semibold text-gray-800 pt-0.5">{item.quantity}</div>
                                        <div className="w-20 text-right text-sm font-bold text-gray-900 pt-0.5">{formatPrice(item.price)}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">Subtotal ({cartCount} items)</span>
                                <span className="text-sm font-bold text-gray-900">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">Delivery ({DELIVERY_METHOD.name})</span>
                                <span className="text-sm font-bold text-gray-900">{formatPrice(DELIVERY_METHOD.price)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-lg font-extrabold text-gray-900">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    <div className="mb-8 px-2">
                        <h3 className="font-bold text-gray-900 text-sm mb-3">Need help? Contact us!</h3>
                        <p className="text-gray-500 mb-1">Please call:</p>
                        <p className="text-sm font-bold text-gray-900 mb-4">+234 812 345 6789</p>
                        <div className="text-gray-500 space-y-0.5">
                            <p>Monday - Friday: 8:00 - 20:00</p>
                            <p>Saturday: 8:00 - 16:00</p>
                        </div>
                    </div>

                    <div className="mb-6 px-2">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Delivery methods</h3>
                        <div className="flex gap-2 items-center">
                            {(["DHL", "FedEx", "GLS"] as const).map((name) => (
                                <div key={name} className="border border-gray-200 bg-white px-3 py-1 flex items-center justify-center min-w-[60px]">
                                    <span className={`text-[10px] font-extrabold tracking-tighter ${name === "DHL" ? "text-red-600 italic" : name === "FedEx" ? "text-purple-800" : "text-blue-900 italic"}`}>{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="px-2">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Payment methods</h3>
                        <div className="flex gap-2 items-center flex-wrap">
                            <div className="border border-gray-200 bg-white px-3 py-1 flex items-center justify-center min-w-[50px]">
                                <span className="text-[10px] font-extrabold text-blue-800 italic">VISA</span>
                            </div>
                            <div className="border border-gray-200 bg-white px-3 py-1 flex items-center justify-center min-w-[50px]">
                                <span className="text-[9px] font-bold text-blue-500">Paystack</span>
                            </div>
                            <div className="border border-gray-200 bg-white px-3 py-1 flex items-center justify-center min-w-[50px]">
                                <div className="flex w-6 h-4 relative">
                                    <div className="w-3 h-3 rounded-full bg-red-500 absolute left-0 opacity-80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 absolute left-2 opacity-80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ValuePropsSection />
        </div>
    );
}