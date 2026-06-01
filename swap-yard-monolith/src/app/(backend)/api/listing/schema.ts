import { z } from "zod";


export const createListingSchema = z.object({
  name: z.string().trim().min(2, "Listing name is required").max(150, "Name is too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  location: z.string().trim().max(150, "Location is too long").nullable().optional(),
  state: z.string().trim().max(100, "State is too long").nullable().optional(),
  status: z.enum(["AVAILABLE", "SOLD"]).default("AVAILABLE"),
  condition: z.enum(["NEW", "FAIRLYNEW", "SECONDHAND", "FAIR", "GOOD"]),
  price: z.number().finite().positive("Price must be greater than 0"),
  negotiable: z.boolean().default(false),
  offersDelivery: z.boolean().default(false),
  contact: z.string().trim().max(50, "Contact is too long").nullable().optional(),
  categoryId: z.string().trim().cuid("Invalid category"),
});

export const getListingsSchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.enum(["AVAILABLE", "SOLD"]).optional(),
  condition: z.enum(["NEW", "FAIRLYNEW", "SECONDHAND", "FAIR", "GOOD"]).optional(),
  state: z.string().trim().min(1).optional(),
  sellerId: z.string().trim().cuid("Invalid sellerId").optional(),
  category: z.string().optional(),
  categoryId: z.string().trim().cuid("Invalid categoryId").optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  offersDelivery: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  negotiable: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
}).refine(
  (data) =>
    data.minPrice === undefined ||
    data.maxPrice === undefined ||
    data.minPrice <= data.maxPrice,
  {
    message: "minPrice cannot be greater than maxPrice",
    path: ["minPrice"],
  }
);


export const updateListingSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(150).optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    location: z.string().trim().max(150).nullable().optional(),
    state: z.string().trim().max(100).nullable().optional(),
    status: z.enum(["AVAILABLE", "SOLD"]).optional(),
    condition: z.enum(["NEW", "FAIRLYNEW", "SECONDHAND", "FAIR", "GOOD"]).optional(),
    price: z.number().finite().positive("Price must be greater than 0").optional(),
    negotiable: z.boolean().optional(),
    offersDelivery: z.boolean().optional(),
    contact: z.string().trim().max(50).nullable().optional(),
    categoryId: z.string().trim().cuid("Invalid categoryId").nullable().optional(),
    replaceImages: z.boolean().default(false),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });