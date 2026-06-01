import { z } from "zod";

export const getNotificationsSchema = z.object({
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
  read: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;