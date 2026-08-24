import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { getUsersSchema } from "./schema";

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

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      search: searchParams.get("search") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const validatedQuery = getUsersSchema.safeParse(rawQuery);
    if (!validatedQuery.success) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: validatedQuery.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { search, role, page, limit } = validatedQuery.data;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { firstname: { contains: search} },
              { lastname: { contains: search } },
              { username: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              receivedReviews: true,
              buyerOrders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        items: users,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}