import { DynamicFieldCategory, DynamicFieldStatus } from "@prisma/client";
import { z } from "zod";

export const dynamicFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
//   fieldName: z.string().min(1, "Field name is required"),
  type: z.string().min(1, "Type is required"),
  options: z.array(z.string()).optional(),
  status: z.nativeEnum(DynamicFieldStatus),
  category: z.nativeEnum(DynamicFieldCategory),
});

export const querySchema = z.object({
  category: z
    .enum(["POST_TAGS", "CORE_TAGS", "KEY_INFORMATION_SECTIONS"])
    .optional(),
});