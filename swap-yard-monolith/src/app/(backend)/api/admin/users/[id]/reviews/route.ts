import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { getUserReviewsSchema } from "../../schema";

export const runtime = "nodejs";

async function getCookie(req: Request, name: string) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  return (
    cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

async function getAuthenticatedAdmin(req: Request) {
  const token = await getCookie(req, "session");
  if (!token) return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };

  const payload = await verifyToken(token);
  const userId = typeof payload === "string" ? payload : payload?.userId;
  if (!userId) return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) return { error: NextResponse.json({ message: "User does not exist" }, { status: 404 }) };
  if (user.role !== "ADMIN") return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };

  return { user };
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const { searchParams } = new URL(req.url);

    const validatedQuery = getUserReviewsSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    });

    if (!validatedQuery.success) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: validatedQuery.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, limit, type } = validatedQuery.data;
    const skip = (page - 1) * limit;

    // "received" = reviews left about this user as a seller (SellerReviews relation)
    // "given"    = reviews this user left about sellers (BuyerReviews relation)
    // NOTE: field names below (rating, comment, sellerId, buyerId) are guessed —
    // adjust the `where`/`select` to match your actual Review model.
    const where = type === "received" ? { sellerId: id } : { buyerId: id };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          ...(type === "received"
            ? { buyer: { select: { id: true, firstname: true, lastname: true } } }
            : { seller: { select: { id: true, firstname: true, lastname: true } } }),
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        type,
        items: reviews,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}