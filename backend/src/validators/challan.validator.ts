import { z } from "zod";

export const challanItemSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be positive"),

  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than 0"),
});

export const createChallanSchema = z.object({
  customerId: z.coerce
    .number()
    .int()
    .positive("Customer ID must be positive"),

  items: z
    .array(challanItemSchema)
    .min(1, "At least one product is required"),
});