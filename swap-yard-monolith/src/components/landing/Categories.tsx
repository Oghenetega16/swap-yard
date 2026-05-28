"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


const CategoryCard = ({ title, image, href }: { title: string, image: string, href: string }) => {
    return (
        <Link 
            href={href} 
            className="h-64 md:h-70 w-full md:w-87.5 shrink-0 rounded-xl overflow-hidden relative group cursor-pointer block shadow-sm hover:shadow-lg transition-all duration-300"
            aria-label={`Browse ${title}`}
        >
            <div className="absolute inset-0 bg-gray-100">
                <Image 
                    src={image} 
                    alt={`${title} category`}
                    fill
                    className="object-cover transition-transform duration-700 ease-linear group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 350px"
                    priority
                />
            </div>
            
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-5 left-5 z-10">
                <span className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-lg text-sm font-bold text-gray-900 shadow-md">
                    {title}
                </span>
            </div>
        </Link>
    );
};

export const Categories = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/category");
                const data = await res.json();

               const formatted = data.map((cat: any) => ({
                title: cat.name,
                href: `/listings?category=${encodeURIComponent(cat.name)}`,
                image: cat.image || "/assets/images/placeholder.jpg",
            }));

                setCategories(formatted);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 370;

            container.scrollTo({
                left: direction === 'left'
                    ? container.scrollLeft - scrollAmount
                    : container.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-16 bg-[#F9FAFB]">
            <div className="container mx-auto px-6 md:px-10 lg:px-12 xl:px-4 max-w-7xl">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            What are you looking for?
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Discover every second-hand item you need!
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#EB3B18] hover:text-[#EB3B18] transition-colors shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#EB3B18] hover:text-[#EB3B18] transition-colors shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading && (
                        <p className="text-sm text-gray-500">Loading categories...</p>
                    )}

                    {!loading && categories.map((category) => (
                        <CategoryCard 
                            key={category.title}
                            title={category.title}
                            href={category.href}
                            image={category.image}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};