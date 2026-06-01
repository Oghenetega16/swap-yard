import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/token";
import { z } from "zod";

const facebookAuthSchema = z.object({
  accessToken: z.string().trim().min(1, "Facebook access token is required"),
});

const facebookEnvSchema = z.object({
  FACEBOOK_APP_ID: z.string().trim().min(5, "Invalid Facebook app ID"),
  FACEBOOK_APP_SECRET: z.string().trim().min(5, "Invalid Facebook app secret"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedBody = facebookAuthSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: validatedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validatedEnv = facebookEnvSchema.safeParse({
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    });

    if (!validatedEnv.success) {
      console.error("Facebook env validation error:", validatedEnv.error.flatten());

      return NextResponse.json(
        { message: "Facebook OAuth is not configured correctly" },
        { status: 500 }
      );
    }

    const { accessToken } = validatedBody.data;
    const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = validatedEnv.data;

    const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;

    const debugUrl =
      `https://graph.facebook.com/debug_token` +
      `?input_token=${encodeURIComponent(accessToken)}` +
      `&access_token=${encodeURIComponent(appAccessToken)}`;

    const debugRes = await fetch(debugUrl);
    const debugJson = await debugRes.json();

    const data = debugJson?.data;

    if (!debugRes.ok || !data?.is_valid ||  data.app_id !== FACEBOOK_APP_ID) {
      return NextResponse.json({ message: "Invalid Facebook token" }, { status: 401 });
    }

    const meUrl =
      `https://graph.facebook.com/me` +
      `?fields=id,name,email` +
      `&access_token=${encodeURIComponent(accessToken)}`;

    const meRes = await fetch(meUrl);
    const meJson = await meRes.json();

    if (!meRes.ok) {
      return NextResponse.json(
        { message: "Failed to fetch Facebook profile" },
        { status: 401 }
      );
    }

    const email = meJson?.email;

    if (typeof email !== "string") {
      return NextResponse.json(
        { message: "Facebook did not return an email. Use normal login." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phoneNumber: true,
        role: true,
        state: true,
        contract: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found for this email. Please sign up first." },
        { status: 401 }
      );
    }

    const sessionToken = await createToken(user.id, user.role);

    const res = NextResponse.json(
      { message: "Login successful", user },
      { status: 200 }
    );

    res.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("Facebook OAuth login error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}