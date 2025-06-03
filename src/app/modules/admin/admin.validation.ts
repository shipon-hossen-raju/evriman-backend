import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const topSales = z.object({
  topSales: z.boolean().optional(),
});

export const adminValidation = {
  createSchema,
  topSales,
};
