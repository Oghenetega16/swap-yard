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

async function getAuthenticatedUser(req: Request) {
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

  return { user };
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(req);
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const { id } = await ctx.params;

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
        // Payouts carry seller financial details — only admin needs to see
        // them here; buyers/sellers get the rest of the order regardless.
        ...(user.role === "ADMIN" ? { payouts: true } : {}),
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isBuyer = order.buyerId === user.id;
    const isSeller = order.items.some((item) => item.sellerId === user.id);

    if (user.role !== "ADMIN" && !isBuyer && !isSeller) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(req);
    if ("error" in auth) return auth.error;
    const { user } = auth;

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

    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        ...(user.role === "ADMIN"
          ? {}
          : {
              OR: [
                { buyerId: user.id },
                { items: { some: { sellerId: user.id } } },
              ],
            }),
      },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isBuyer = existingOrder.buyerId === user.id;
    const isSeller = existingOrder.items.some((item) => item.sellerId === user.id);
    const currentStatus = existingOrder.status;

    // Admin is exempt from every check below — that's the whole point of
    // the admin override. Everyone else follows the normal business rules.
    if (user.role !== "ADMIN") {
      if (newStatus === "SHIPPED" && !isSeller) {
        return NextResponse.json(
          { message: "Only seller can mark as shipped" },
          { status: 403 }
        );
      }
      if (newStatus === "SHIPPED" && currentStatus !== "PAID") {
        return NextResponse.json(
          { message: "Order must be paid before it can be shipped" },
          { status: 400 }
        );
      }
      if (newStatus === "DELIVERED" && !isSeller) {
        return NextResponse.json(
          { message: "Only seller can mark as delivered" },
          { status: 403 }
        );
      }
      if (newStatus === "COMPLETED" && !isBuyer) {
        return NextResponse.json(
          { message: "Only buyer can complete order" },
          { status: 403 }
        );
      }
      if (newStatus === "CANCELLED" && !isBuyer) {
        return NextResponse.json(
          { message: "Only buyer can cancel order" },
          { status: 403 }
        );
      }
      if (newStatus === "DELIVERED" && currentStatus !== "SHIPPED") {
        return NextResponse.json(
          { message: "Order must be shipped before it can be marked delivered" },
          { status: 400 }
        );
      }
      if (newStatus === "COMPLETED" && currentStatus !== "DELIVERED") {
        return NextResponse.json(
          { message: "Order must be DELIVERED before completion" },
          { status: 400 }
        );
      }
      if (newStatus === "CANCELLED" && currentStatus !== "PENDING_PAYMENT") {
        return NextResponse.json(
          { message: "Cannot cancel after payment" },
          { status: 400 }
        );
      }
    }

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
    console.error("PATCH ORDER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}