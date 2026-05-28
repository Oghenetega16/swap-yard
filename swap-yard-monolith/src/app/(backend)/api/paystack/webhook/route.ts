import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, amount, metadata } = await req.json();

        if (!email || !amount) {
            return NextResponse.json(
                { status: false, message: "email and amount are required" },
                { status: 400 }
            );
        }

        const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
            body: JSON.stringify({
                email,
                amount,           
                currency: "NGN",
                metadata: metadata ?? {},
            }),
        });

        const paystackData = await paystackRes.json();

        if (!paystackRes.ok || !paystackData.status) {
            console.error("[Paystack initialize] API error:", paystackData);
            return NextResponse.json(
                { status: false, message: paystackData?.message ?? "Paystack error" },
                { status: paystackRes.status || 502 }
            );
        }

        return NextResponse.json(paystackData, { status: 200 });
    } catch (error) {
        console.error("[Paystack initialize] Unexpected error:", error);
        return NextResponse.json(
            { status: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}