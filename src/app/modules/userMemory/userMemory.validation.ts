import { z } from "zod";

// Create Memory Schema
export const createUserMemorySchema = z.object({
  content: z.string().min(1, "Content is required"),
  files: z.array(z.string().url("File is required")),
  isPublish: z.boolean().default(false),
  tagId: z.string().min(1, "TagId is required"),
  userId: z.string().min(1, "User ID is required"),
  contactIds: z
    .array(z.string().min(1, "Contact id required"))
    .optional()
    .default([]),
  publish: z.string().optional()
});

// Update Memory Schema
export const updateUserMemorySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  files: z.array(z.string().url("File is required")).optional(),
  content: z.string().min(1, "Content is required").optional(),
  tagId: z.string().min(1, "TagId is required").optional(),
  tags: z.string().min(1, "Tag is required").optional(),
  contactIds: z.array(z.string()).optional().default([]),
  isPublish: z.boolean().optional(),
  publish: z.string().optional(),
});
