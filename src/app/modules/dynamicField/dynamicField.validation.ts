import { DynamicFieldCategory, DynamicFieldStatus } from "@prisma/client";
import { z } from "zod";

export const dynamicFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
//   fieldName: z.string().min(1, "Field name is required"),
  type: z.string().min(1, "Type is required"),
  options: z.array(z.string()).optional(), // only required if type === 'select'
  status: z.nativeEnum(DynamicFieldStatus),
  category: z.nativeEnum(DynamicFieldCategory),
});
