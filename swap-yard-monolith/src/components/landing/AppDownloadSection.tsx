import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

export const AppDownloadSection = () => {
    return (
        <section className="bg-[#FFF0EB] py-20 overflow-hidden" aria-labelledby="app-download-heading">
            <div className="container mx-auto px-6 md:px-10 lg:px-12 xl:px-4 max-w-7xl flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0">
                    <h2 id="app-download-heading" className="text-3xl md:text-5xl font-extrabold text-[#002147] mb-6">List. Chat. Deal. <br/> All on Your Phone</h2>
                    <p className="text-gray-600 mb-8 max-w-md">Visit our listings to browse listings and discover items near you. It&apos;s fast, free, and secure.</p>
                    <Button variant="primary">
                        
                        <Link href="/listings" passHref>
                            Get the App
                        </Link>
                </Button>
                </div>

                <div className="md:w-1/2 flex justify-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-pink-200 rounded-full blur-3xl opacity-50"></div>
                    {/* Phone Mockup Placeholder */}
                    <div className="relative w-70 h-137.5 bg-white border-8 border-gray-900 rounded-[3rem] shadow-2xl overflow-hidden z-10">
                        <Image 
                            src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500" 
                            alt="App Screenshot" 
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 w-4/5">
                            <div className="h-10 w-10 bg-orange-100 rounded flex items-center justify-center">
                                <MapPin className="text-[#EB3B18]" aria-hidden="true" />
                            </div>
                            <div>
                                <div className="text-xs font-bold">Map View</div>
                                <div className="text-[10px] text-gray-500">Find items near you</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};