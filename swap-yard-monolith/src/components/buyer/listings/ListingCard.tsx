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
  status: "SOLD" | "AVAILABLE";
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
  status,
}: ListingCardProps) {

  if (status === "SOLD") {
    return null;
  }

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(id);

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({ id, title, price, imageUrl, quantity: 1 });
    toast.success("Added to cart!");
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist({ id, title, price, imageUrl, location, rating, reviewsCount });
      toast.success("Added to wishlist!");
    }
  };

  const listingHref = `/listings/${slug}`;

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative">

      <Link
        href={listingHref}
        className="relative aspect-square w-full bg-gray-100 overflow-hidden block cursor-pointer z-0"
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

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

      <button
        aria-label={isWishlisted ? `Remove ${title} from favourites` : `Save ${title} to favourites`}
        onClick={handleFavorite}
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full transition-colors shadow-sm cursor-pointer z-10 ${
          isWishlisted
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-red-500 hover:bg-white"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

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

        <Link
          href={listingHref}
          className="hover:text-[#EB3B18] transition-colors cursor-pointer w-fit inline-block"
        >
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-100">
          <span className="font-bold text-sm sm:text-lg text-gray-900 tracking-tight">
            {formattedPrice}
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href={listingHref}
              className="text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-md sm:rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap cursor-pointer"
            >
              View
            </Link>

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