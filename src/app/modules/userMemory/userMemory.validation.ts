import { z } from "zod";

// Create Memory Schema
export const createUserMemorySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tag: z.string().min(1, "Tag is required"),
  status: z.boolean().optional().default(true),
});

// Update Memory Schema
export const updateUserMemorySchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  tag: z.string().min(1, "Tag is required").optional(),
  status: z.boolean().optional(),
});
