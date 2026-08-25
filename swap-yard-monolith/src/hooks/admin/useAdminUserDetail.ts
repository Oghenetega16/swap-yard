"use client";

import { useCallback, useEffect, useState } from "react";

interface UserDetail {
  id: string;
  firstname: string | null;
  lastname: string | null;
  username: string | null;
  email: string;
  role: string;
  state: string | null;
  address: string | null;
  deliveryAddress: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  emailVerified: string | null;
  image: string | null;
  contract: boolean;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  verification: unknown | null;
  sellerAccount: {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
    isVerified: boolean;
  } | null;
  _count: {
    listings: number;
    receivedReviews: number;
    givenReviews: number;
    buyerOrders: number;
    reports: number;
  };
}

interface Listing {
  id: string;
  name: string;
  price: number;
  status: string;
  images: { id: string; url: string }[];
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  buyer?: { id: string; firstname: string | null; lastname: string | null };
  seller?: { id: string; firstname: string | null; lastname: string | null };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const emptyMeta: Meta = { total: 0, page: 1, limit: 10, pages: 0 };

export function useAdminUserDetail(userId: string) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsMeta, setListingsMeta] = useState<Meta>(emptyMeta);
  const [listingsPage, setListingsPage] = useState(1);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState<Meta>(emptyMeta);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsType, setReviewsType] = useState<"received" | "given">("received");
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to load user");
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const params = new URLSearchParams({ page: String(listingsPage), limit: "10" });
      const res = await fetch(`/api/admin/users/${userId}/listings?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to load listings");
      setListings(data.items ?? []);
      setListingsMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingListings(false);
    }
  }, [userId, listingsPage]);

  const fetchReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const params = new URLSearchParams({ page: String(reviewsPage), limit: "10", type: reviewsType });
      const res = await fetch(`/api/admin/users/${userId}/reviews?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to load reviews");
      setReviews(data.items ?? []);
      setReviewsMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [userId, reviewsPage, reviewsType]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    state: {
      user,
      isLoading,
      error,
      listings,
      listingsMeta,
      listingsPage,
      isLoadingListings,
      reviews,
      reviewsMeta,
      reviewsPage,
      reviewsType,
      isLoadingReviews,
    },
    setters: { setListingsPage, setReviewsPage, setReviewsType },
  };
}