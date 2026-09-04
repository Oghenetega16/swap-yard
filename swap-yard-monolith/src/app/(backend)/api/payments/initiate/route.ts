import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";

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
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const orderId = body?.orderId;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ ok: false, message: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== user.id) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { ok: false, message: "This order is not awaiting payment" },
        { status: 400 }
      );
    }

    if (!order.payment) {
      return NextResponse.json(
        { ok: false, message: "No payment record found for this order" },
        { status: 400 }
      );
    }

    const amountInKobo = Math.round(order.totalAmount * 100);
    // Reference is regenerated on every initiate call — Paystack rejects
    // reusing a reference that's already been sent to /transaction/initialize.
    // paymentId is carried in metadata so verification/webhooks can still
    // resolve this back to the right Payment/Order without depending on the
    // reference format.
    const reference = `${order.payment.id}-${Date.now()}`;

    // Record the reference we're about to use — providerRef is @unique on
    // Payment, so each new attempt overwrites the last, which is fine since
    // we only ever care about the most recent in-flight attempt.
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { providerRef: reference },
    });

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        currency: "NGN",
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        metadata: {
          orderId: order.id,
          paymentId: order.payment.id,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("[Paystack initialize] API error:", paystackData);
      return NextResponse.json(
        { ok: false, message: paystackData?.message ?? "Paystack error" },
        { status: paystackRes.status || 502 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        authorizationUrl: paystackData.data.authorization_url,
        email: user.email,
        amountInKobo,
        reference,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Payments initiate] Unexpected error:", error);
    return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
  }
}