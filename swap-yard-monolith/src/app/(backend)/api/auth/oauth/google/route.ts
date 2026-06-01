import { NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/token";
import { googleAuthSchema, googleClientIdSchema } from "../../schema";

const googleJWKs = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedBody = googleAuthSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          message: "Google token does not meet schema requirements",
          errors: validatedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validatedEnv = googleClientIdSchema.safeParse({
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    });

    if (!validatedEnv.success) {
      console.error("Invalid GOOGLE_CLIENT_ID", validatedEnv.error.flatten());

      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const { idToken } = validatedBody.data;
    const { GOOGLE_CLIENT_ID } = validatedEnv.data;

    const { payload } = await jwtVerify(idToken, googleJWKs, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: GOOGLE_CLIENT_ID,
    });

    const email = payload.email;
    const emailVerified = payload.email_verified;

    if (typeof email !== "string") {
      return NextResponse.json(
        { message: "Google did not return an email" },
        { status: 400 }
      );
    }

    if (emailVerified !== true) {
      return NextResponse.json(
        { message: "Google email is not verified" },
        { status: 401 }
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
    console.error("Google OAuth login error:", err);

    return NextResponse.json(
      { message: "Invalid or expired Google token" },
      { status: 401 }
    );
  }
}