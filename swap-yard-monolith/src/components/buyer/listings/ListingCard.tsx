"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, ShieldCheck, ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext"; 
import { useWishlist } from "@/app/context/WishlistContext"; 
import toast from "react-hot-toast"; 

export interface ListingCardProps {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  location: string;
  condition: string;
  imageUrl: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
}

export default function ListingCard({
  id,
  slug,
  title,
  category,
  price,
  location,
  condition,
  imageUrl,
  isVerified,
  rating,
  reviewsCount,
}: ListingCardProps) {
  // 1. Destructure contexts
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Check if this specific item is in the wishlist
  const isWishlisted = isInWishlist(id);

  // Format price to Naira
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);

  // Handle Add to Cart logic
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    // Optimistic UI update: Instantly update global cart context
    addToCart({
      id,
      title,
      price,
      imageUrl,
      quantity: 1
    });
    
    // Instantly show success toast
    toast.success(`Successfully added to cart!`);

    // Quietly sync with the database in the background
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in as a buyer to save items across devices.");
        } else {
          const data = await res.json();
          console.error("Cart sync error:", data.message);
        }
      }
    } catch (err) {
      console.error("Error syncing cart to database:", err);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({
        id,
        title,
        price,
        imageUrl,
        location,
        rating,
        reviewsCount
      });
      toast.success("Added to wishlist!");
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative">
      
      <Link href={`/listings/${slug}`} className="relative aspect-square w-full bg-gray-100 overflow-hidden block cursor-pointer z-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Top Left Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10">
          <span className="bg-white text-gray-800 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm w-fit">
            {condition}
          </span>
          {isVerified && (
            <span className="bg-white text-gray-800 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
              Verified
            </span>
          )}
        </div>
      </Link>

      {/* Favorite Button - Conditional styling added for active state */}
      <button 
        aria-label={isWishlisted ? `Remove ${title} from favorites` : `Save ${title} to favorites`} 
        onClick={handleFavorite} 
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full transition-colors shadow-sm cursor-pointer z-10 ${
          isWishlisted ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500 hover:bg-white"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1 sm:mb-1.5">
          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider line-clamp-1 pr-2">
            {category}
          </span>
          <div className="flex items-center text-[10px] sm:text-xs text-gray-600 font-medium shrink-0">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-yellow-400 mr-1" />
            {rating.toFixed(1)} ({reviewsCount})
          </div>
        </div>

        {/* Title - Wrapped in Link */}
        <Link href={`/listings/${slug}`} className="hover:text-[#EB3B18] transition-colors cursor-pointer w-fit inline-block">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100">
          {/* Price */}
          <span className="font-bold text-sm sm:text-lg text-gray-900 tracking-tight">
            {formattedPrice}
          </span>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Listing Button */}
            <Link
              href={`/listings/${slug}`}
              className="text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-md sm:rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap cursor-pointer"
            >
              View
            </Link>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${title} to cart`}
              className="flex items-center justify-center p-1.5 sm:p-2 bg-[#EB3B18] text-white rounded-md sm:rounded-lg hover:bg-[#d93616] transition-colors shadow-sm cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}