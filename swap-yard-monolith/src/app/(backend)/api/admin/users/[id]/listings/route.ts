import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { getUserSubResourceSchema } from "../../schema";

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

    const validatedQuery = getUserSubResourceSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!validatedQuery.success) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: validatedQuery.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, limit } = validatedQuery.data;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { sellerId: id },
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
          images: { select: { id: true, url: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where: { sellerId: id } }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        items: listings,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}