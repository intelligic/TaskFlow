import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  assignedTo: z.string().min(1, "Assignee is required"),
  status: z.enum(["pending", "completed", "closed", "archived"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
