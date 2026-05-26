import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken"
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { PlusCircle, Bell, MapPin } from "lucide-react";

export default async function SellerLayout({
    children,
}: {
    children: ReactNode;
}) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            role: string;
        };

        if (decoded.role !== "SELLER") {
            redirect("/");
        }
    } catch {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col pt-20">
            <div className="container mx-auto px-4 md:px-8 lg:px-12 py-8 max-w-7xl flex-1 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-70 shrink-0">
                    <SellerSidebar />
                </div>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>

            <div className="bg-[#F9FAFB] py-16 mt-auto">
                <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

                        <div className="flex items-start gap-4">
                            <div className="shrink-0 h-12 w-12 bg-[#002147] rounded-full flex items-center justify-center text-white mt-1">
                                <PlusCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-extrabold text-base md:text-lg mb-1">
                                    List Products Easily
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Create, edit and manage your listings in minutes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="shrink-0 h-12 w-12 bg-[#002147] rounded-full flex items-center justify-center text-white mt-1">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-extrabold text-base md:text-lg mb-1">
                                    Order Notifications
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Get notified instantly when a customer places an order
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="shrink-0 h-12 w-12 bg-[#002147] rounded-full flex items-center justify-center text-white mt-1">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-extrabold text-base md:text-lg mb-1">
                                    Reach Local Buyers
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Sell to customers near you with location based listings
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}