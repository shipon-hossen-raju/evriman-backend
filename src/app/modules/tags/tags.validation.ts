import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tag name is required" })
    .max(50, { message: "Tag name must be less than 50 characters" }),
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tag name is required" })
    .max(50, { message: "Tag name must be less than 50 characters" }),
  status: z.boolean(),
});
