import { DynamicFieldCategory, DynamicFieldStatus, DynamicFieldType } from "@prisma/client";
import { z } from "zod";

export const dynamicFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
//   fieldName: z.string().min(1, "Field name is required"),
  type: z.nativeEnum(DynamicFieldType),
  options: z.array(z.string()).optional(),
  status: z.nativeEnum(DynamicFieldStatus),
  category: z.nativeEnum(DynamicFieldCategory),
});

export const querySchema = z.object({
  category: z.nativeEnum(DynamicFieldCategory).optional(),
});