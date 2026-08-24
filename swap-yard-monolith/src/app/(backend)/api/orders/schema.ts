import { z } from "zod";


export const getOrdersSchema = z
  .object({
    status: z
      .enum([
        "PENDING_PAYMENT",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "BUYER_CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
        "DISPUTED",
      ])
      .optional(),
    scope: z.enum(["buyer", "seller", "admin"]).default("buyer"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();


export const updateOrderSchema = z
  .object({
    status: z.enum([
      "PENDING_PAYMENT",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "BUYER_CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
      "DISPUTED",
    ]),
  })
  .strict();


export const checkoutSchema = z.object({
  pickupLocation: z.string().min(3),
  pickupNote: z.string().optional(),
});