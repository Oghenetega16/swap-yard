"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, LayoutGrid, Map as MapIcon, ChevronDown, ShieldCheck, Filter, Heart, MapPin, Star, Loader2 } from "lucide-react";
import FilterSidebar from "@/components/buyer/listings/FilterSidebar";
import ActiveFiltersBar from "@/components/buyer/listings/ActiveFiltersBar";
import ListingCard from "@/components/buyer/listings/ListingCard";
import ValuePropsSection from "@/components/buyer/listings/ValuePropsSection";
import Pagination from "@/components/buyer/listings/Pagination";
import Image from "next/image";
import Link from "next/link";
import { ListingsMap } from "@/components/buyer/listings/ListingMap";

const HorizontalListingCard = ({ item }: { item: any }) => {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(item.price);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0 relative group">
      <Link href={`/listings/${item.id}`} className="relative w-28 h-28 shrink-0 bg-gray-100 rounded-2xl overflow-hidden block">
        <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </Link>
      <div className="flex flex-col flex-1 py-1">
        <div className="flex justify-between items-start mb-1">
            <div className="font-extrabold text-[#002147] text-base">{formattedPrice}</div>
            <button aria-label="Save to favorites" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer z-10">
              <Heart className="w-5 h-5" />
            </button>
        </div>
        <Link href={`/listings/${item.id}`} className="hover:text-[#EB3B18] transition-colors inline-block w-fit">
          <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2 pr-2">
            {item.title}
          </h3>
        </Link>
        <div className="flex items-center text-[11px] text-gray-500 mb-1">
          <MapPin className="w-3 h-3 mr-1" /> {item.location}
        </div>
        <div className="flex items-center text-[11px] text-gray-500 mb-3">
          <Star className="w-3 h-3 mr-1 text-gray-400" /> {item.rating.toFixed(1)}({item.reviewsCount})
        </div>
        <div className="mt-auto">
          <Link href={`/listings/${item.id}`} className="inline-block text-[11px] font-bold px-4 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            View Listing
          </Link>
        </div>
      </div>
    </div>
  );
};

const AreaListingCardDesktop = ({ item }: { item: any }) => {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
  }).format(item.price);

  return (
      <div className="flex flex-col gap-3 group">
          <div className="relative aspect-square w-full rounded-[1.25rem] overflow-hidden bg-gray-100">
              <Link href={`/listings/${item.id}`} className="absolute inset-0 z-0">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <button aria-label="Save to favorites" className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm transition-colors z-10 cursor-pointer">
                  <Heart className="w-4 h-4" />
              </button>
          </div>
          <div className="flex flex-col">
              <Link href={`/listings/${item.id}`} className="hover:text-[#EB3B18] transition-colors z-10 inline-block w-fit">
                <h3 className="font-bold text-[13px] text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                    {item.title}
                </h3>
              </Link>
              <div className="flex items-center text-[11px] text-gray-500 mb-1">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
              </div>
              <div className="flex items-center text-[11px] text-gray-500 mb-3">
                  <Star className="w-3 h-3 mr-1 text-gray-400" /> {item.rating.toFixed(1)}({item.reviewsCount})
              </div>
              <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-3">
                  <span className="font-extrabold text-[15px] text-[#002147] tracking-tight">{formattedPrice}</span>
                  <Link href={`/listings/${item.id}`} className="text-[10px] font-bold px-3 py-1.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer z-10">
                      View Listing
                  </Link>
              </div>
          </div>
      </div>
  );
};

function ListingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  
  const [listings, setListings] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const queryString = searchParams.toString();
        const res = await fetch(`/api/listing?${queryString}`);
        const data = await res.json();
        
        if (data.ok) {
          const mappedData = data.items.map((item: any, index: number) => {
            const dummyCoords = [
              { lat: 6.5568, lng: 3.3852 }, { lat: 6.5244, lng: 3.3792 },
              { lat: 6.4531, lng: 3.3958 }, { lat: 6.6018, lng: 3.3515 }
            ];
            
            return {
              id: item.id,
              title: item.name,
              category: item.category?.name || "Uncategorized",
              price: item.price,
              location: item.location || "Location not specified",
              condition: item.condition || "Used",
              imageUrl: item.images && item.images.length > 0 
                ? item.images[0].url 
                : "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=500&auto=format&fit=crop",
              isVerified: true, // Mocked for UI
              rating: 4.8,      // Mocked for UI
              reviewsCount: 12, // Mocked for UI
              lat: dummyCoords[index % dummyCoords.length].lat,
              lng: dummyCoords[index % dummyCoords.length].lng,
            };
          });

          setListings(mappedData);
          setMeta(data.meta);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFilters("q", searchInput);
  };

  const updateFilters = (key: string, value: string, isArray = false) => {
    const params = new URLSearchParams(searchParams.toString());

    if (isArray) {
      const currentValues = params.getAll(key);
      if (currentValues.includes(value)) {
        params.delete(key);
        currentValues.filter(v => v !== value).forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    } else {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    // Reset to page 1 when filters change
    if (key !== "page") params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  // UPDATED: Now accepts the specific value to remove so it doesn't wipe out arrays
  const removeSpecificFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    

    if (valueToRemove) {
      const currentValues = params.getAll(key);
      if (currentValues.length > 1) {
        params.delete(key);
        // Put back all the other values EXCEPT the one we are removing
        currentValues.filter(v => v !== valueToRemove).forEach(v => params.append(key, v));
      } else {
        params.delete(key); // If it's the last one, just delete the key entirely
      }
    } else {
      params.delete(key); // Fallback for single-value filters
    }

    if (key === "q") setSearchInput("");
    router.push(`${pathname}?${params.toString()}`);
  };

  // UPDATED: Added the raw 'value' so ActiveFiltersBar can pass it to the remove function
  const activeFiltersPills = Array.from(searchParams.entries())
    .filter(([key]) => key !== "page" && key !== "limit") // Hide pagination from pills
    .map(([key, value]) => ({
      key: key, 
      value: value, // Pass the raw value down
      label: value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  const formattedListingsForMap = listings.map(item => ({
    id: item.id,
    title: item.title,
    price: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(item.price),
    location: item.location,
    image: item.imageUrl, 
    lat: item.lat,
    lng: item.lng
  }));

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* DESKTOP ONLY: Top Row */}
        <div className="hidden lg:flex flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for furniture, electronics, appliances..." 
                aria-label="Search for items"
                className="w-full pl-11 pr-4 py-3 placeholder:text-sm bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#002147] shadow-sm"
              />
            </div>
            <button type="submit" className="px-8 py-3 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
              Search
            </button>
          </form>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-2 rounded-md shadow-sm cursor-pointer transition-colors ${viewMode === "grid" ? "bg-[#EB3B18] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              </button>
              <button 
                onClick={() => setViewMode("map")}
                aria-label="Map view"
                className={`p-2 rounded-md shadow-sm cursor-pointer transition-colors ${viewMode === "map" ? "bg-[#EB3B18] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <MapIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-200" aria-hidden="true"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sort By:</span>
              <button className="text-sm font-bold text-gray-900 flex items-center gap-1 hover:text-gray-600 transition-colors cursor-pointer">
                Newest <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="hidden lg:block w-64 shrink-0">
             <FilterSidebar currentFilters={searchParams} onFilterChange={updateFilters} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            
            <div className="w-full flex flex-col lg:hidden">
              <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for furniture, electronics..." 
                  aria-label="Search for items"
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#002147] shadow-sm"
                />
                <button type="button" aria-label="Open filters" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                  <Filter className="w-5 h-5" aria-hidden="true" />
                </button>
              </form>

              <div className="mb-4 overflow-x-auto pb-1">
                <ActiveFiltersBar activeFilters={activeFiltersPills} onRemove={removeSpecificFilter} onClearAll={clearAllFilters} />
              </div>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sort By:</span>
                  <button className="text-sm font-bold text-gray-900 flex items-center gap-1 hover:text-gray-600 transition-colors cursor-pointer">
                    Newest <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    className={`p-1.5 rounded-md shadow-sm cursor-pointer transition-colors ${viewMode === "grid" ? "bg-[#EB3B18] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button 
                    onClick={() => setViewMode("map")}
                    aria-label="Map view"
                    className={`p-1.5 rounded-md shadow-sm cursor-pointer transition-colors ${viewMode === "map" ? "bg-[#EB3B18] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    <MapIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 lg:mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Listings</h1>
                <p className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">{meta.total}</span> items found
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Quick View:</span>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-green-600" aria-hidden="true" /> Verified Sellers Only
                </button>
              </div>
            </div>

            <div className="hidden lg:block mb-6">
              <ActiveFiltersBar activeFilters={activeFiltersPills} onRemove={removeSpecificFilter} onClearAll={clearAllFilters} />
            </div>
            
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#EB3B18] animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-sm">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                 <Search className="w-12 h-12 text-gray-300 mb-4" />
                 <h3 className="text-lg font-bold text-gray-900 mb-2">No listings found</h3>
                 <p className="text-gray-500 max-w-sm mb-6">We couldn't find any items matching your current filters. Try adjusting your search criteria.</p>
                 <button onClick={clearAllFilters} className="px-6 py-2 bg-[#EB3B18] text-white font-bold rounded-lg hover:bg-[#d93616] transition-colors">
                   Clear all filters
                 </button>
               </div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {listings.map((listing, i) => (
                    <ListingCard key={listing.id || i} {...listing} />
                  ))}
                </div>
                {meta.pages > 1 && (
                  <div className="mt-8">
                    <Pagination />
                  </div>
                )}
              </>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="relative mb-8">
                  <ListingsMap listings={formattedListingsForMap} />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                    <button className="bg-white px-4 py-2.5 rounded-full shadow-md text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <Search className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" /> Search this area
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-gray-900 mb-1">Items in this area</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Showing {listings.length} items found
                  </p>
                </div>

                <div className="flex flex-col md:hidden">
                  {listings.slice(0, 4).map((listing, i) => (
                    <HorizontalListingCard key={listing.id || i} item={listing} />
                  ))}
                </div>

                <div className="hidden md:grid grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                  {listings.slice(0, 4).map((listing, i) => (
                    <AreaListingCardDesktop key={listing.id || i} item={listing} />
                  ))}
                </div>

                {listings.length > 4 && (
                  <div className="mt-10 flex justify-center">
                    <button className="px-8 py-3 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-full hover:bg-gray-50 shadow-sm transition-colors">
                      Load More Items 
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* ========================================================= */}

          </div>
        </div>

        <ValuePropsSection />
      </main>
    </div>
  );
}

export default function BrowseListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#EB3B18] animate-spin" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}