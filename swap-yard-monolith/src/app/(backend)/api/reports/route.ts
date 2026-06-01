import { NextResponse } from "next/server";
import { deleteManyByPublicIds, uploadManyImageFiles } from "@/app/(backend)/utils/cloudinary";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/token";
import { createReportSchema, getReportsSchema } from "./schema";

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

function toNullableString(value: FormDataEntryValue | null) {
  const parsed = String(value || "").trim();
  return parsed ? parsed : null;
}

export async function POST(req: Request) {
  const idempotencyKey = req.headers.get("idempotency-key");
  if (!idempotencyKey) {
    return NextResponse.json({ message: "Idempotency-Key header is required" }, { status: 400 });
  }

  let uploaded: Array<{ url: string; public_id: string }> = [];

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

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingReport = await prisma.report.findUnique({
      where: { idempotencyKey },
    });

    if (existingReport) {
      return NextResponse.json({ message: "Report already submitted", report: existingReport }, { status: 200 });
    }

    const formData = await req.formData();
    const rawInput = {
      listingId: String(formData.get("listingId") || "").trim(),
      type: String(formData.get("type") || "").trim(),
      reason: String(formData.get("reason") || "").trim(),
      comment: toNullableString(formData.get("comment")),
    };

    const validatedInput = createReportSchema.safeParse(rawInput);
    if (!validatedInput.success) {
      return NextResponse.json({
        message: "Validation Error",
        errors: validatedInput.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const listingExists = await prisma.listing.findUnique({
      where: { id: validatedInput.data.listingId },
    });
    if (!listingExists) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    const images = formData.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
    if (images.length > 2) {
      return NextResponse.json({ message: "A maximum of 2 images is allowed" }, { status: 400 });
    }

    uploaded = images.length ? await uploadManyImageFiles(images, { subfolder: "reports" }) : [];

    const report = await prisma.report.create({
      data: {
        idempotencyKey,
        reporterId: user.id,
        listingId: validatedInput.data.listingId,
        type: validatedInput.data.type,
        reason: validatedInput.data.reason,
        comment: validatedInput.data.comment,
        imageUrl1: uploaded[0]?.url ?? null,
        imagePublicId1: uploaded[0]?.public_id ?? null,
        imageUrl2: uploaded[1]?.url ?? null,
        imagePublicId2: uploaded[1]?.public_id ?? null,
      },
      include: {
        reporter: { select: { id: true, firstname: true, lastname: true } },
        listing: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ message: "Report submitted successfully", report }, { status: 201 });
  } catch (err: any) {
    if (uploaded.length > 0) {
      await deleteManyByPublicIds(uploaded.map((img) => img.public_id)).catch(console.error);
    }
    console.error("Error creating report:", err);
    return NextResponse.json({ message: err.message || "Server Error" }, { status: 500 });
  }
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
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const rawParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      type: searchParams.get("type"),
    };

    const validatedParams = getReportsSchema.safeParse(rawParams);
    if (!validatedParams.success) {
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    const { page, limit, status, type } = validatedParams.data;
    const skip = (page - 1) * limit;

    const where = {
      ...(user.role !== "ADMIN" && { reporterId: user.id }),
      ...(status && { status }),
      ...(type && { type }),
    };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          reporter: { select: { id: true, firstname: true, lastname: true } },
          listing: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      items: reports,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching reports:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}