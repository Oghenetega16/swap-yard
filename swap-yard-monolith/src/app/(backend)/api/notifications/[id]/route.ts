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

async function getAuthUser(req: Request) {
  const token = await getCookie(req, "session");
  if (!token) return null;

  const payload = await verifyToken(token);
  const userId = typeof payload === "string" ? payload : payload?.userId;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, notification });
  } catch (err: any) {
    console.error("Error fetching notification:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (notification.read) {
      return NextResponse.json({ message: "Notification is already marked as read", notification });
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });

    return NextResponse.json({ message: "Notification marked as read", notification: updated });
  } catch (err: any) {
    console.error("Error updating notification:", err);
    return NextResponse.json({ message: err.message || "Server Error" }, { status: 500 });
  }
}