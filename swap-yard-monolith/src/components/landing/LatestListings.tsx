"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import ListingCard from "@/components/buyer/listings/ListingCard"; 

export const LatestListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/listing?limit=8");
        const data = await res.json();
        
        if (data.ok) {
          const mappedData = data.items.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.name,
            category: item.category?.name || "General",
            price: item.price,
            location: item.location || "Lagos, Nigeria",
            condition: item.condition || "Barely Used",
            imageUrl: item.images?.[0]?.url || "/assets/images/placeholder.jpg",
            isVerified: true,
            rating: 4.8,     
            reviewsCount: 12,
          }));
          setListings(mappedData);
        }
      } catch (error) {
        console.error("Error fetching latest listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <section className="py-20 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#002147] tracking-tight">
              Latest Arrivals
            </h2>
            <p className="text-gray-500 mt-1">
              Explore the newest items added to our collection
            </p>
          </div>
          <Link 
            href="/listings" 
            className="text-sm font-bold text-[#EB3B18] hover:underline transition-all"
          >
            Browse All Items →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#EB3B18] animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-medium">Loading new arrivals...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <p className="text-gray-400">No recent listings available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {listings.map((item) => (
              <ListingCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};