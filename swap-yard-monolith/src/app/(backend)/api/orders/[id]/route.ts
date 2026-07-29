import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { updateOrderSchema } from "../schema";

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

  // Adjust "ADMIN" to whatever your Role enum actually calls the admin role.
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

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

    // No OR buyerId/sellerId filter — admin can open any order.
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { id: true, firstname: true, lastname: true, email: true },
        },
        items: {
          include: {
            listing: { select: { id: true, name: true, price: true } },
            seller: { select: { id: true, firstname: true, lastname: true, email: true } },
          },
        },
        payment: true,
        payouts: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("ADMIN GET ORDER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newStatus = parsed.data.status;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Admin is exempt from the isBuyer/isSeller + sequential-status checks
    // that the regular PATCH route enforces — that's the whole point of the
    // admin surface: full override capability.
    const updateData: any = { status: newStatus };

    if (newStatus === "DELIVERED") updateData.deliveredAt = new Date();
    if (newStatus === "COMPLETED") updateData.completedAt = new Date();
    if (newStatus === "CANCELLED") updateData.cancelledAt = new Date();

    const order = await prisma.$transaction(async (tx) => {
      if (newStatus === "CANCELLED" || newStatus === "REFUNDED") {
        const listingIds = existingOrder.items
          .map((item) => item.listingId)
          .filter(Boolean) as string[];

        if (listingIds.length > 0) {
          await tx.listing.updateMany({
            where: { id: { in: listingIds } },
            data: { status: "AVAILABLE" },
          });
        }
      }

      return await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          buyer: {
            select: { id: true, firstname: true, lastname: true, email: true },
          },
          items: {
            include: {
              listing: { select: { id: true, name: true, price: true } },
              seller: { select: { id: true, firstname: true, lastname: true, email: true } },
            },
          },
          payment: true,
        },
      });
    }, { timeout: 10000 });

    return NextResponse.json(
      { message: "Order updated successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN PATCH ORDER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}