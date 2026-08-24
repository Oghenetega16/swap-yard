import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import AdminLayoutClient from "./adminLayoutClient";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function AdminLayout({
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

    decoded = payload as {
      userId: string;
      role: string;
    };
  } catch (error) {
    console.error("JWT verification failed:", error);

    redirect("/login");
  }

  if (decoded.role !== "ADMIN") {
    redirect("/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}