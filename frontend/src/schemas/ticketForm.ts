import { z } from "zod";

export const ticketFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: z.string().trim().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
  assigned_to: z.union([z.number().int().positive(), z.null()]).optional().nullable(),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const commentFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(5000, "Comment must be at most 5000 characters"),
});

export type CommentFormValues = z.infer<typeof commentFormSchema>;
