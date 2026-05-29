"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutGrid, 
    MessageSquare, 
    ShoppingBag, 
    Store, 
    Receipt, 
    ShieldCheck, 
    Settings, 
    LogOut,
    PlusCircle 
} from "lucide-react";
import { useState } from "react";

export const SellerSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navItems = [
        { name: "Post Listing", href: "/seller/post-listing", icon: PlusCircle }, 
        { name: "Orders", href: "/seller/orders", icon: ShoppingBag },
        { name: "My Store", href: "/seller/store", icon: Store },
        { name: "Payments", href: "/seller/billings", icon: Receipt },
    ];

    const bottomItems = [
        { name: "Get Verified", href: "/seller/kyc", icon: ShieldCheck },
        { name: "Account", href: "/seller/account", icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                router.push("/auth/login");
            } else {
                console.error("Logout failed");
                setIsLoggingOut(false);
            }
        } catch (error) {
            console.error("An error occurred during logout:", error);
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full min-h-150">
            <h2 className="text-xl font-extrabold text-gray-900 mb-8">Sellers's Hub</h2>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-2 mb-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                    ? "bg-[#002147] text-white" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-100 my-2"></div>

            {/* Secondary Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
                {bottomItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                    ? "bg-[#002147] text-white" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Log Out Button */}
            <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Log out of account"
                className="mt-auto flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#EB3B18] hover:bg-red-50 transition-colors w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <LogOut size={18} />
                {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
        </aside>
    );
};