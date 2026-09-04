"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type VerifyState = "checking" | "success" | "failed" | "error";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [state, setState] = useState<VerifyState>("checking");
    const [message, setMessage] = useState<string | null>(null);

    // Paystack appends both `reference` and `trxref` — they're the same value.
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");

    useEffect(() => {
        if (!reference) {
            setState("error");
            setMessage("No payment reference found in the URL.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`);
                const data = await res.json();

                if (!res.ok || !data.ok) {
                    setState("error");
                    setMessage(data.message ?? "Could not verify payment.");
                    return;
                }

                if (data.status === "success") {
                    setState("success");
                } else {
                    setState("failed");
                    setMessage(`Payment status: ${data.status}`);
                }
            } catch {
                setState("error");
                setMessage("Something went wrong while verifying your payment.");
            }
        };

        verify();
    }, [reference]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
                {state === "checking" && (
                    <>
                        <Loader2 className="w-10 h-10 text-[#EB3B18] animate-spin mx-auto mb-4" />
                        <h1 className="text-lg font-bold text-gray-900 mb-1">Confirming your payment…</h1>
                        <p className="text-sm text-gray-500">This should only take a moment.</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                        <h1 className="text-lg font-bold text-gray-900 mb-1">Payment successful</h1>
                        <p className="text-sm text-gray-500 mb-6">Your order has been marked as paid.</p>
                        <button
                            onClick={() => router.push("/orders")}
                            className="w-full py-2.5 rounded-xl bg-[#EB3B18] hover:bg-[#d93616] text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                            View my orders
                        </button>
                    </>
                )}

                {(state === "failed" || state === "error") && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-lg font-bold text-gray-900 mb-1">
                            {state === "failed" ? "Payment not completed" : "Couldn't confirm payment"}
                        </h1>
                        <p className="text-sm text-gray-500 mb-6">
                            {message ?? "Please check your orders page or try again."}
                        </p>
                        <Link
                            href="/orders"
                            className="block w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors"
                        >
                            Back to orders
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}