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

async function getUserId(req: Request) {
  const token = await getCookie(req, "session");
  if (!token) return null;

  const payload = await verifyToken(token);
  return typeof payload === "string" ? payload : payload?.userId;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { buyerId: userId },
          {
            items: {
              some: { sellerId: userId },
            },
          },
        ],
      },
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
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
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
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const newStatus = parsed.data.status;

    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { buyerId: userId },
          {
            items: {
              some: { sellerId: userId },
            },
          },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isBuyer = existingOrder.buyerId === userId;
    const isSeller = existingOrder.items.some(
      (item) => item.sellerId === userId
    );
    const currentStatus = existingOrder.status;

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

    if (newStatus === "DELIVERED" && currentStatus !== "PAID") {
      return NextResponse.json(
        { message: "Order must be PAID before delivery" },
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

    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    if (newStatus === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    if (newStatus === "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    const order = await prisma.$transaction(async (tx) => {
      if (newStatus === "CANCELLED") {
        const listingIds = existingOrder.items
          .map((item) => item.listingId)
          .filter(Boolean) as string[];

        if (listingIds.length > 0) {
          await tx.listing.updateMany({
            where: {
              id: { in: listingIds },
            },
            data: {
              status: "AVAILABLE",
            },
          });
        }
      }

      return await tx.order.update({
        where: { id },
        data: updateData,
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
          },
        });
    }, {timeout: 10000});

    return NextResponse.json(
      {
        message: "Order updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH ORDER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}