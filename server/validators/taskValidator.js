import { z } from "zod";

export const createTaskSchema = z.object({

  title: z.string().min(3, "Title must be at least 3 characters"),

  description: z.string().optional(),

  projectId: z.string().optional(),

  assignedTo: z.string().optional(),

  assignee: z.string().optional(),

  tags: z.array(z.string().min(1)).optional(),

  dueDate: z.string().optional(),

  priority: z.enum(["low","medium","high"]).optional(),

  status: z
    .enum([
      "TODO",
      "IN_PROGRESS",
      "REVIEW",
      "COMPLETED",
      "todo",
      "in-progress",
      "done",
      "pending",
      "completed",
      "closed",
    ])
    .optional()

});
