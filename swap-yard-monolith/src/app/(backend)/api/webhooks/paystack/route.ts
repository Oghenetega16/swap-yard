import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expectedSignature) {
    console.error("[Paystack webhook] Invalid signature");
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  // Always 200 past this point — Paystack retries aggressively on non-2xx,
  // and any real problem below is ours to fix, not something a retry solves.
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { reference, amount, metadata } = event.data ?? {};
  const paymentId = metadata?.paymentId;
  const orderId = metadata?.orderId;

  if (!paymentId || !orderId) {
    console.error("[Paystack webhook] Missing metadata on event", event.data);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      console.error("[Paystack webhook] Payment not found:", paymentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Idempotency guard — Paystack can and does deliver the same webhook
    // more than once, and this also covers the case where /api/payments/verify
    // already processed this same payment from the callback redirect.
    if (payment.status === "SUCCESS") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Sanity check the amount actually paid matches what we expected —
    // guards against a tampered client-side amount or metadata mismatch.
    const expectedKobo = Math.round(payment.amount * 100);
    if (amount !== expectedKobo) {
      console.error("[Paystack webhook] Amount mismatch", { expectedKobo, received: amount, paymentId });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "SUCCESS",
          providerRef: reference,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      }),
    ]);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[Paystack webhook] Processing error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}