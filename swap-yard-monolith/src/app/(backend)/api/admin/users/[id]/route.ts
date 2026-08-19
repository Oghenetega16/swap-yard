import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";

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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        role: true,
        state: true,
        address: true,
        deliveryAddress: true,
        phoneNumber: true,
        dateOfBirth: true,
        emailVerified: true,
        image: true,
        contract: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        verification: true,
        sellerAccount: {
          select: {
            id: true,
            bankName: true,
            accountName: true,
            accountNumber: true,
            accountType: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            listings: true,
            receivedReviews: true,
            givenReviews: true,
            buyerOrders: true,
            reports: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin user detail:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}