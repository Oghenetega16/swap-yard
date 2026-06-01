import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getListingsSchema } from "@/app/(backend)/api/listing/schema";

export async function fetchListings(searchParams: URLSearchParams, extraWhere?: Prisma.ListingWhereInput) {
  const rawQuery = {
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    condition: searchParams.get("condition") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    sellerId: searchParams.get("sellerId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    offersDelivery: searchParams.get("offersDelivery") ?? undefined,
    negotiable: searchParams.get("negotiable") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  };

  const validatedQuery = getListingsSchema.safeParse(rawQuery);
  if (!validatedQuery.success) {
    throw new Error("INVALID_PARAMS");
  }

  const { q, status, condition, state, category, sellerId, categoryId, minPrice, maxPrice, offersDelivery, negotiable, page, limit } = validatedQuery.data;
  const skip = (page - 1) * limit;

  const where: Prisma.ListingWhereInput = {
    ...extraWhere,
    ...(status ? { status } : {}),
    ...(condition ? { condition } : {}),
    ...(state ? { state } : {}),
    ...(sellerId ? { sellerId } : {}),
    ...(category ? { category: { name: { equals: category } } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(offersDelivery !== undefined ? { offersDelivery } : {}),
    ...(negotiable !== undefined ? { negotiable } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined ? {
      price: {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      },
    } : {}),
  };

  if (q) {
    where.OR = [
      { name: { contains: q} },
      { description: { contains: q} },
      { category: { name: { contains: q} } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: true,
        category: { select: { id: true, name: true, image: true } },
        seller: { select: { id: true, firstname: true, lastname: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return { items, total, page, limit };
}