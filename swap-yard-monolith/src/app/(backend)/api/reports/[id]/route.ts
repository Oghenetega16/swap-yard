import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { updateReportStatusSchema } from "../schema";

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

const STATUS_NOTIFICATION: Record<string, { type: string; message: (id: string) => string }> = {
  UNDER_REVIEW: {
    type: "REPORT_UNDER_REVIEW",
    message: (id) => `Your report (${id}) is now under review. We'll keep you updated.`,
  },
  RESOLVED: {
    type: "REPORT_RESOLVED",
    message: (id) => `Your report (${id}) has been resolved. Thank you for helping keep the platform safe.`,
  },
  REJECTED: {
    type: "REPORT_REJECTED",
    message: (id) => `Your report (${id}) has been reviewed and did not meet our action criteria.`,
  },
  OPEN: {
    type: "REPORT_REOPENED",
    message: (id) => `Your report (${id}) has been re-opened for review.`,
  },
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getCookie(req, "session");
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = typeof payload === "string" ? payload : payload?.userId;
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const report = await prisma.report.findUnique({
      where: { id: (await params).id },
      include: {
        reporter: { select: { id: true, firstname: true, lastname: true } },
        listing: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && report.reporterId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    console.error("Error fetching report:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getCookie(req, "session");
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    const userId = typeof payload === "string" ? payload : payload?.userId;
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const validatedInput = updateReportStatusSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json({
        message: "Validation Error",
        errors: validatedInput.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { status } = validatedInput.data;

    const existingReport = await prisma.report.findUnique({
      where: { id: (await params).id },
    });

    if (!existingReport) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    if (existingReport.status === status) {
      return NextResponse.json({ message: `Report is already ${status}` }, { status: 400 });
    }

    const notifTemplate = STATUS_NOTIFICATION[status];

    const [report] = await prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id: (await params).id },
        data: { status },
        include: {
          reporter: { select: { id: true, firstname: true, lastname: true } },
          listing: { select: { id: true, name: true, slug: true } },
        },
      });

      await tx.notification.create({
        data: {
          userId: existingReport.reporterId,
          type: notifTemplate.type,
          message: notifTemplate.message(existingReport.id),
        },
      });

      return [updated];
    });

    return NextResponse.json({ message: "Report status updated", report });
  } catch (err: any) {
    console.error("Error updating report:", err);
    return NextResponse.json({ message: err.message || "Server Error" }, { status: 500 });
  }
}