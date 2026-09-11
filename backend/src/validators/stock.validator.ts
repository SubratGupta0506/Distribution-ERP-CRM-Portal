import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be positive"),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than 0"),

  type: z.enum(["IN", "OUT"]),

  reason: z
    .string()
    .min(2, "Reason must be at least 2 characters"),
});