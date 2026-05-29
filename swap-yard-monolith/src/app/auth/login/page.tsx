"use client";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Lock, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import Logo from "@/components/ui/Logo";
import GoogleButton from "../components/googleauthbtn";
import FacebookButton from "../components/facebookauthbtn";

export default function LoginPage() {
    const router = useRouter(); 
    const [loading, setLoading] = useState(false);
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const LoginIllustration = (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome Back!</h2>
            <div className="grid grid-cols-2 gap-4 h-100">
                <div className="bg-gray-200 rounded-lg bg-[url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80')] bg-cover bg-center h-full row-span-2" />
                <div className="bg-gray-200 rounded-lg bg-[url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80')] bg-cover bg-center h-48" />
                <div className="bg-gray-200 rounded-lg bg-[url('https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&q=80')] bg-cover bg-center h-full" />
            </div>
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setSuccess("")

        if (!emailOrPhone.trim() || !password) {
            setError("Email/Phone and password are required.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailOrPhone.trim(), password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.message ?? "Login failed. Please try again.");
                return;
            }
            
            setSuccess("Login Successful, redirecting...")

            // ==========================================
            // NEW: Merge Guest Cart Logic
            // ==========================================
            try {
                const localCart = JSON.parse(localStorage.getItem("swapyard_cart") || "[]");
                
                if (localCart.length > 0) {
                    const itemsToMerge = localCart.map((item: any) => ({
                        listingId: item.id,
                        quantity: item.quantity,
                    }));

                    await fetch("/api/cart/merge", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ items: itemsToMerge }),
                    });
                }
            } catch (mergeError) {
                console.error("Failed to merge cart:", mergeError);
            }
            // ==========================================
            
            if (data.user?.role?.toLowerCase() === "seller") {
                router.push("/seller/account");
            } else {
                router.push("/listings"); 
            }
        
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="" illustration={LoginIllustration} mobileTopRight={<Logo />}>
            <div className="w-full max-w-md mx-auto pb-32 md:pb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">Login</h1>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Email address / Phone Number"
                        placeholder="Enter Email address/Phone Number"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                    />

                    <Input
                        label="Password"
                        type="password"
                        isPassword
                        icon={<Lock className="w-4 h-4" />}
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="w-full flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-[#D84315] text-sm font-semibold hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}    </div>
                    )}

                    {success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}    </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-[#D84315] py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Logging in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                    <p className="mt-5 mb-10 text-center text-gray-600 text-sm">Or</p>

                    <div className="flex mx-auto items-center justify-center space-x-5">
                        <GoogleButton onSuccessMessage={(msg:any) => setSuccess(msg)} onErrorMessage={(msg:any) => setError(msg)}/>
                        <FacebookButton onSuccessMessage={(msg:any) => setSuccess(msg)} onErrorMessage={(msg:any) => setError(msg)}/> 
                    </div>

                    <div className="text-center mt-8 text-sm text-gray-600">
                        New to Swapyard?{" "}
                        <Link href="/auth/signup" className="text-[#D84315] font-bold hover:underline">
                            Create account
                        </Link>
                    </div>
                </form>

                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F0F4F8] px-6 py-6 text-center z-10">
                    <p className="text-sm text-gray-800 leading-relaxed">
                        Login with your username and password to access your account.
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}