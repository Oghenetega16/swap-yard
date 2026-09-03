import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { checkoutSchema } from "../schema";

export const runtime = "nodejs";

function getCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  return (
    cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.split("=")[1] ?? null
  );
}

async function getUser(req: Request) {
  try {
    const token = getCookie(req, "session");
    if (!token) return null;
    const payload = await verifyToken(token);
    const userId = typeof payload === "string" ? payload : payload?.userId;
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId, role: "BUYER" } });
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return NextResponse.json(
      { message: "Idempotency-Key header is required" },
      { status: 400 }
    );
  }

  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingEntry = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingEntry?.status === "COMPLETED") {
      return NextResponse.json(existingEntry.response, { status: 200 });
    }

    if (existingEntry?.status === "PENDING") {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60_000);
      if (existingEntry.updatedAt > twoMinutesAgo) {
        return NextResponse.json(
          { message: "Request is already being processed" },
          { status: 409 }
        );
      }
    }

    await prisma.idempotencyKey.upsert({
      where: { key: idempotencyKey },
      update: { status: "PENDING" },
      create: { key: idempotencyKey, status: "PENDING" },
    });

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pickupLocation, pickupNote } = parsed.data;

    const cart = await prisma.cart.findUnique({
      where: { buyerId: user.id },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                name: true,
                price: true,
                sellerId: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    let subtotal = 0;
    const orderItemsData = cart.items.map((item) => {
      if (item.listing.status !== "AVAILABLE") {
        throw new Error(`Item "${item.listing.name}" is no longer available`);
      }
      subtotal += item.listing.price * item.quantity;
      return {
        listingId: item.listing.id,
        sellerId: item.listing.sellerId,
        listingName: item.listing.name,
        unitPrice: item.listing.price,
        quantity: item.quantity,
      };
    });

    const deliveryFee = 0;
    const platformCommission = subtotal * 0.015;
    const totalAmount = subtotal + deliveryFee;
    const listingIds = orderItemsData.map((i) => i.listingId);

    const newOrder = await prisma.$transaction(
      async (tx) => {
        const created = await tx.order.create({
          data: {
            buyerId: user.id,
            pickupLocation,
            pickupNote,
            subtotal,
            deliveryFee,
            platformCommission,
            totalAmount,
            items: { create: orderItemsData },
            payment: {
              create: {
                buyerId: user.id,
                amount: totalAmount,
                status: "PENDING",
                provider: "PAYSTACK",
              },
            },
          },
          include: { payment: true },
        });

        await tx.listing.updateMany({
          where: { id: { in: listingIds }, status: "AVAILABLE" },
          data: { status: "SOLD" },
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return created;
      },

      { timeout: 15_000 }
    );

    // --- Paystack initialization (outside transaction, external call) ---
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: Math.round(totalAmount * 100),
          reference: newOrder.payment?.id,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
  return NextResponse.json(
    { 
      message: "Order created, but payment initialization failed.", 
      order: newOrder,
      error: paystackData.message 
    },
    { status: 207 }
  );
}

    const finalResponse = {
      message: "Order created",
      order: newOrder,
      paymentUrl: paystackData.data.authorization_url,
    };

    await prisma.idempotencyKey.update({
      where: { key: idempotencyKey },
      data: { status: "COMPLETED", response: finalResponse as any },
    });

    return NextResponse.json(finalResponse, { status: 200 });
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    if (
      error.message?.includes("no longer available") ||
      error.message === "Cart is empty"
    ) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}