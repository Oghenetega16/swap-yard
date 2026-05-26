import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function BuyerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded: { userId: string; role: string };
    try {
  const { payload } = await jwtVerify(token, secret);

  console.log("Decoded token:", payload);

  decoded = payload as {
    userId: string;
    role: string;
  };
} catch (error) {
  console.error("JWT verification failed:", error);

  redirect("/login");
}
  if (decoded.role !== "BUYER") {
    redirect("/login");
  }

  return <>{children}</>;
}
