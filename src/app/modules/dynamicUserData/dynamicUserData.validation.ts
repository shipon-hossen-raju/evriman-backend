import { DynamicFieldType } from "@prisma/client";
import { z } from "zod";

export const userDynamicFieldValueSchema = z.object({
  id: z.string().optional(),
  userId: z
    .string()
    .length(24, "Invalid userId: must be a 24-character ObjectId"),
  fieldName: z.string().min(1, "Field name is required"),
  value: z.string().min(1, "Value is required"),
  category: z.string().min(1, "Category is required"),
  fieldType: z.nativeEnum(DynamicFieldType),
  text: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
