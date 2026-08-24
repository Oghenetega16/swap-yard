import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { addToCartSchema, updateCartItemSchema } from "./schema";

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

async function getUser(req: Request) {
  const token = await getCookie(req, "session");
  if (!token) return null;

  const payload = await verifyToken(token);
  const userId = typeof payload === "string" ? payload : payload?.userId;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  // Cart access is no longer BUYER-only — admins can use it too.
  if (user.role !== "BUYER" && user.role !== "ADMIN") return null;

  return user;
}


export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
                images: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { listingId, quantity } = parsed.data;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { buyerId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          buyerId: user.id,
        },
      });
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        listingId,
        quantity,
      },
    });

    return NextResponse.json({ message: "Added to cart" });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function PATCH(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { listingId, quantity } = parsed.data;

    const cart = await prisma.cart.findUnique({
      where: { buyerId: user.id },
    });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.update({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId,
        },
      },
      data: { quantity },
    });

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { message: "Listing ID required" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { buyerId: user.id },
    });

    if (!cart) {
      return NextResponse.json(
        { message: "Cart not found" },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId,
        },
      },
    });

    return NextResponse.json({ message: "Item removed" });
  } catch (error) {
    console.error("DELETE CART ITEM ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}