import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { getNotificationsSchema } from "./schema";

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

export async function GET(req: Request) {
  try {
    const token = await getCookie(req, "session");
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = typeof payload === "string" ? payload : payload?.userId;
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const rawParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      read: searchParams.get("read"),
    };

    const validatedParams = getNotificationsSchema.safeParse(rawParams);
    if (!validatedParams.success) {
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    const { page, limit, read } = validatedParams.data;
    const skip = (page - 1) * limit;

    const where = {
      userId: user.id,
      ...(read !== undefined && { read }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);

    return NextResponse.json({
      ok: true,
      items: notifications,
      meta: {
        total,
        unreadCount,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}