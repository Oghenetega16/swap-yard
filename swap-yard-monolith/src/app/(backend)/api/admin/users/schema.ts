import { z } from "zod";

export const ROLES = ["BUYER", "SELLER", "ADMIN"] as const;

export const getUsersSchema = z.object({
  search: z.string().trim().min(1).optional(),
  role: z.enum(ROLES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const getUserSubResourceSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const getUserReviewsSchema = getUserSubResourceSchema.extend({
  type: z.enum(["received", "given"]).default("received"),
});

export type GetUsersInput = z.infer<typeof getUsersSchema>;