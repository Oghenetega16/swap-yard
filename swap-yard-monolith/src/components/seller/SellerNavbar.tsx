"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageSquare, ShoppingBag, Bell, Menu } from "lucide-react";
import Logo from "@/components/ui/Logo";

interface SellerNavbarProps {
    onOpenSidebar?: () => void;
}

export const SellerNavbar = ({ onOpenSidebar }: SellerNavbarProps) => {
    const pathname = usePathname();
    

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        avatarUrl: null as string | null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        firstName: data.user.firstname || "",
                        lastName: data.user.lastname || "",
                        avatarUrl: data.user.avatarUrl || null
                    });
                }
            } catch (err) {
                console.error("Failed to fetch user data for navbar:", err);
            }
        };

        fetchProfile();
    }, []);

    // --- HELPER: GET INITIALS ---
    const getInitials = () => {
        const first = profile.firstName.charAt(0) || "";
        const last = profile.lastName.charAt(0) || "";
        return (first + last).toUpperCase() || "U";
    };

    const navLinks = [
        { name: "Orders", href: "/seller/orders" },
        { name: "My Store", href: "/seller/store" },
        { name: "Post Listings", href: "/seller/post-listing" },
        { name: "My Profile", href: "/seller/account" },
    ];

    return (
        <nav className="fixed w-full z-40 top-0 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-20">
                
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-900 cursor-pointer" onClick={onOpenSidebar} aria-label="Open mobile menu">
                        <Menu size={24} aria-hidden="true" />
                    </button>
                    <Logo /> 
                </div>

                <div className="hidden lg:flex items-center gap-8 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || pathname?.startsWith(link.href);
                        return (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={`text-sm font-medium transition-colors cursor-pointer ${
                                    isActive ? "text-[#002147] font-bold" : "text-gray-600 hover:text-[#002147]"
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Icons and Avatar Toggle */}
                <div className="flex items-center gap-4 md:gap-6 text-gray-900">
                    
                    {/* Icons */}
                    <div className="hidden sm:flex items-center gap-5">
                        <Link href="/seller/orders" className="hover:text-[#EB3B18] transition-colors cursor-pointer" aria-label="Orders">
                            <ShoppingBag size={22} aria-hidden="true" />
                        </Link>
                        <Link href="/seller/notifications" className="hover:text-[#EB3B18] transition-colors relative cursor-pointer" aria-label="Notifications">
                            <Bell size={22} aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    <button 
                        className="hidden md:flex items-center justify-between w-26 h-11 border border-gray-900 rounded-full px-1 bg-white cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
                        title="Switch to Buyer mode"
                        aria-label="Switch to Buyer mode"
                    >
                        <span className="text-xs font-bold text-[#002147] pl-2.5 tracking-wide">SELLER</span>
                        
                        {/* Profile Picture / Initials inside the toggle */}
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-[#002147] flex items-center justify-center text-white">
                            {profile.avatarUrl ? (
                                <Image 
                                    src={profile.avatarUrl} 
                                    alt="Profile Avatar" 
                                    width={36} 
                                    height={36} 
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-sm font-bold">{getInitials()}</span>
                            )}
                        </div>
                    </button>
                    
                    {/* Mobile-only avatar (shows when the toggle is hidden on small screens) */}
                    <Link href="/seller/account" className="md:hidden shrink-0 cursor-pointer" aria-label="Go to account settings">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-[#EB3B18] transition-colors bg-[#002147] flex items-center justify-center text-white">
                            {profile.avatarUrl ? (
                                <Image 
                                    src={profile.avatarUrl} 
                                    alt="Profile Avatar" 
                                    width={36} 
                                    height={36} 
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-sm font-bold">{getInitials()}</span>
                            )}
                        </div>
                    </Link>

                </div>
            </div>
        </nav>
    );
};