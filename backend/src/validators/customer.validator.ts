import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z.string().optional(),

  status: z
    .enum(["LEAD", "ACTIVE", "INACTIVE"])
    .optional(),

  followUpDate: z.coerce.date().optional(),

  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();