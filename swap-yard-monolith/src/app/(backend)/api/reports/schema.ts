import { z } from "zod";

const VALID_STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const;

export const createReportSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  type: z.string().min(1, "Report type is required"),
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be 500 characters or fewer"),
  comment: z.string().max(1000, "Comment must be 1000 characters or fewer").nullable().optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(VALID_STATUSES, {
    message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
  }),
});

export const getReportsSchema = z.object({
  page: z
    .string()
    .nullable()
    .optional()
    .transform((v) => Math.max(1, parseInt(v || "1", 10)))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .nullable()
    .optional()
    .transform((v) => Math.min(50, Math.max(1, parseInt(v || "20", 10))))
    .pipe(z.number().int().positive()),
  status: z.enum(VALID_STATUSES).nullable().optional(),
  type: z.string().nullable().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type GetReportsInput = z.infer<typeof getReportsSchema>;