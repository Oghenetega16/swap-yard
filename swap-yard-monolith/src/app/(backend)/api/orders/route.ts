import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { getOrdersSchema } from "./schema";

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

async function getAuthenticatedUser(req: Request) {
  const token = await getCookie(req, "session");

  if (!token) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const payload = await verifyToken(token);
  const userId = typeof payload === "string" ? payload : payload?.userId;

  if (!userId) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      firstname: true,
      lastname: true,
      email: true,
    },
  });

  if (!user) {
    return {
      error: NextResponse.json({ message: "User does not exist" }, { status: 404 }),
    };
  }

  return { user };
}

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedUser(req);
    if ("error" in auth) return auth.error;

    const { user } = auth;

    const { searchParams } = new URL(req.url);

    const rawQuery = {
      status: searchParams.get("status") ?? undefined,
      scope: searchParams.get("scope") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };

    const validatedQuery = getOrdersSchema.safeParse(rawQuery);

    if (!validatedQuery.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: validatedQuery.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, scope, page, limit } = validatedQuery.data;

    // scope=admin is the only branch that requires the ADMIN role —
    // buyer/seller scopes are just "show me my own orders" and are open
    // to any authenticated user.
    if (scope === "admin" && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(status ? { status } : {}),
      ...(scope === "buyer"
        ? { buyerId: user.id }
        : scope === "seller"
        ? {
            items: {
              some: {
                sellerId: user.id,
              },
            },
          }
        : {}), // scope === "admin" — no owner filter, sees every order
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          items: {
            include: {
              listing: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  status: true,
                  condition: true,
                  images: {
                    select: {
                      id: true,
                      url: true,
                      publicId: true,
                    },
                  },
                },
              },
              seller: {
                select: {
                  id: true,
                  firstname: true,
                  lastname: true,
                  email: true,
                },
              },
            },
          },
          payment: true,
          payouts: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        items: orders,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          scope,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}