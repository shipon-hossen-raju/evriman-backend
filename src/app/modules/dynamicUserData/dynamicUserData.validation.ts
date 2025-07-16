import { DynamicFieldCategory, DynamicFieldType } from "@prisma/client";
import { z } from "zod";

export const userDynamicFieldValueSchema = z.object({
  // userId: z
  //   .string()
  //   .length(24, "Invalid userId: must be a 24-character ObjectId"),
  fieldName: z.string().min(1, "Field name is required"),
  text: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  category: z.nativeEnum(DynamicFieldCategory),
  fieldType: z.nativeEnum(DynamicFieldType),
});

export const updateUserDynamicFieldValueSchema = z.object({
  // userId: z
  //   .string()
  //   .length(24, "Invalid userId: must be a 24-character ObjectId"),
  fieldName: z.string().min(1, "Field name is required").optional(),
  text: z.string().optional(),
  value: z.string().min(1, "Value is required").optional(),
  category: z.nativeEnum(DynamicFieldCategory).optional(),
  fieldType: z.nativeEnum(DynamicFieldType).optional(),
});