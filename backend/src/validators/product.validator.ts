import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),

  sku: z.string().min(1, "SKU is required"),

  category: z.string().min(1, "Category is required"),

  unitPrice: z.coerce
    .number()
    .min(0, "Unit price cannot be negative"),

  currentStock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .optional(),

  minStock: z.coerce
    .number()
    .int()
    .min(0, "Minimum stock cannot be negative")
    .optional(),

  location: z.string().optional(),

  warehouse: z.string().optional(),
});

export const updateProductSchema =
  createProductSchema.partial();