export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'closed' | 'archived';

export interface TaskCommentAuthor {
  _id?: string;
  name?: string;
  email?: string;
}

export interface TaskComment {
  _id: string;
  author?: TaskCommentAuthor;
  message: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string | { _id?: string; name?: string; email?: string; designation?: string };
  createdBy?: string | { _id?: string; name?: string; email?: string };
  assignee?: string; // Legacy or temporary field
  comments?: string[] | TaskComment[];
  dueDate?: string;
  tags?: string[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}