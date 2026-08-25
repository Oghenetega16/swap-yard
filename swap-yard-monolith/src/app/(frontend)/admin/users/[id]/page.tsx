"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { useAdminUserDetail } from "@/hooks/admin/useAdminUserDetail"

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, setters } = useAdminUserDetail(params.id);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (state.error || !state.user) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
        {state.error ?? "User not found"}
      </div>
    );
  }

  const user = state.user;
  const displayName = [user.firstname, user.lastname].filter(Boolean).join(" ") || user.email;
  const initial = (user.firstname?.[0] ?? user.email[0]).toUpperCase();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium"
      >
        <ArrowLeft size={16} /> Back to users
      </button>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center font-bold text-2xl text-slate-600 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
            <p className="text-sm text-slate-400">{user.username ? `@${user.username}` : user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                  user.role === "BUYER"
                    ? "bg-blue-50 text-blue-600"
                    : user.role === "SELLER"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-purple-50 text-purple-600"
                }`}
              >
                {formatRole(user.role)}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  user.emailVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {user.emailVerified ? "Email Verified" : "Email Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-slate-900">{user._count.listings}</p>
            <p className="text-[11px] text-slate-400">Listings</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{user._count.receivedReviews}</p>
            <p className="text-[11px] text-slate-400">Reviews</p>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{user._count.buyerOrders}</p>
            <p className="text-[11px] text-slate-400">Orders</p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 mb-4 text-sm">Profile Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Email</dt><dd className="text-slate-800 font-medium">{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Phone</dt><dd className="text-slate-800 font-medium">{user.phoneNumber ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">State</dt><dd className="text-slate-800 font-medium">{user.state ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Address</dt><dd className="text-slate-800 font-medium text-right">{user.address ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Delivery Address</dt><dd className="text-slate-800 font-medium text-right">{user.deliveryAddress ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Date of Birth</dt><dd className="text-slate-800 font-medium">{formatDate(user.dateOfBirth)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Joined</dt><dd className="text-slate-800 font-medium">{formatDate(user.createdAt)}</dd></div>
          </dl>
          {user.bio && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-xs mb-1">Bio</p>
              <p className="text-slate-700 text-sm">{user.bio}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 mb-4 text-sm">Seller Account</h2>
          {user.sellerAccount ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Bank</dt><dd className="text-slate-800 font-medium">{user.sellerAccount.bankName}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Account Name</dt><dd className="text-slate-800 font-medium">{user.sellerAccount.accountName}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Account Number</dt><dd className="text-slate-800 font-medium">{user.sellerAccount.accountNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Account Type</dt><dd className="text-slate-800 font-medium">{user.sellerAccount.accountType}</dd></div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Payout Verified</dt>
                <dd>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${user.sellerAccount.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {user.sellerAccount.isVerified ? "Verified" : "Pending"}
                  </span>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-400">This user has no seller account.</p>
          )}
        </div>
      </div>

      {/* Tabs: Listings / Reviews */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 px-6">
          {(["listings", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-4 px-3 mr-4 text-sm font-semibold border-b-2 transition-all ${
                tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "listings" ? `Listings (${user._count.listings})` : `Reviews (${user._count.receivedReviews})`}
            </button>
          ))}
        </div>

        {tab === "listings" && (
          <div className="p-6">
            {state.isLoadingListings ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading listings...</div>
            ) : state.listings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No listings yet.</div>
            ) : (
              <div className="space-y-3">
                {state.listings.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {listing.images?.[0]?.url && (
                        <img src={listing.images[0].url} alt={listing.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{listing.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(listing.createdAt)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-600 whitespace-nowrap">
                      {listing.status}
                    </span>
                    <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{formatPrice(listing.price)}</p>
                  </div>
                ))}
              </div>
            )}

            {state.listingsMeta.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setters.setListingsPage((p) => Math.max(1, p - 1))}
                  disabled={state.listingsPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-2 py-1.5 text-xs text-slate-400">
                  Page {state.listingsMeta.page} of {state.listingsMeta.pages}
                </span>
                <button
                  onClick={() => setters.setListingsPage((p) => Math.min(state.listingsMeta.pages, p + 1))}
                  disabled={state.listingsPage >= state.listingsMeta.pages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setters.setReviewsType("received")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  state.reviewsType === "received" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Received (as seller)
              </button>
              <button
                onClick={() => setters.setReviewsType("given")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  state.reviewsType === "given" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Given (as buyer)
              </button>
            </div>

            {state.isLoadingReviews ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading reviews...</div>
            ) : state.reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No reviews yet.</div>
            ) : (
              <div className="space-y-3">
                {state.reviews.map((review) => {
                  const other = state.reviewsType === "received" ? review.buyer : review.seller;
                  const otherName = other ? [other.firstname, other.lastname].filter(Boolean).join(" ") || "—" : "—";

                  return (
                    <div key={review.id} className="p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-slate-900 text-sm">{otherName}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">{formatDate(review.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {state.reviewsMeta.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setters.setReviewsPage((p) => Math.max(1, p - 1))}
                  disabled={state.reviewsPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-2 py-1.5 text-xs text-slate-400">
                  Page {state.reviewsMeta.page} of {state.reviewsMeta.pages}
                </span>
                <button
                  onClick={() => setters.setReviewsPage((p) => Math.min(state.reviewsMeta.pages, p + 1))}
                  disabled={state.reviewsPage >= state.reviewsMeta.pages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}