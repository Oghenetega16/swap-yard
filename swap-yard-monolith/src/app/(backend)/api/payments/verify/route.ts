import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ ok: false, message: "reference is required" }, { status: 400 });
  }

  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json(
        { ok: false, message: paystackData?.message ?? "Verification failed" },
        { status: paystackRes.status || 502 }
      );
    }

    const { status, amount, metadata } = paystackData.data;
    const paymentId = metadata?.paymentId;
    const orderId = metadata?.orderId;

    if (status !== "success") {
      return NextResponse.json({ ok: true, status, verified: false, orderId: orderId ?? null });
    }

    // Best-effort local update here too — the webhook is still the
    // authoritative path, but this gives instant feedback on the success
    // page instead of waiting on webhook delivery, and covers the rare case
    // where the webhook never arrives at all.
    if (paymentId && orderId) {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

      if (payment && payment.status !== "SUCCESS") {
        const expectedKobo = Math.round(payment.amount * 100);
        if (amount === expectedKobo) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: paymentId },
              data: { status: "SUCCESS", providerRef: reference, paidAt: new Date() },
            }),
            prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
          ]);
        } else {
          console.error("[Payments verify] Amount mismatch", { expectedKobo, received: amount, paymentId });
        }
      }
    }

    return NextResponse.json({ ok: true, status, verified: true, orderId: orderId ?? null });
  } catch (error) {
    console.error("[Payments verify] Error:", error);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}