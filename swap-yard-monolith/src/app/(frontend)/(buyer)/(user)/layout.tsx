"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Mail, Heart, Ticket, LogOut } from "lucide-react";

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const SIDEBAR_LINKS = [
        { name: "My Account", icon: <User size={20} />, href: "/profile" },
        { name: "Orders", icon: <Package size={20} />, href: "/orders" },
        { name: "INotifications", icon: <Mail size={20} />, href: "/notifications" },
        { name: "Wishlist", icon: <Heart size={20} />, href: "/wishlist" },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
            
            <aside className="md:w-64 bg-white border-r border-gray-200 shrink-0 hidden md:flex flex-col py-8 px-4">
                <div className="mb-8 px-4">
                    <h2 className="text-[11px] font-extrabold text-black uppercase tracking-widest mb-4">ACCOUNT MENU</h2>
                    <nav className="flex flex-col gap-2">
                        {SIDEBAR_LINKS.map((link) => {
                            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                            
                            return (
                                <Link 
                                    key={link.name} 
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                                        isActive 
                                            ? "text-white bg-[#EB3B18]" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-[#EB3B18]"
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto px-4">
                    <button className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#EB3B18] hover:bg-orange-50 rounded-xl transition-colors w-full cursor-pointer">
                        <LogOut size={20} />
                        Log out
                    </button>
                </div>
            </aside>

            <main className="w-full">
                {children}
            </main>
            
        </div>
    );
}