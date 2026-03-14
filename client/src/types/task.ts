export type TaskStatus = 'pending' | 'completed' | 'closed' | 'archived';

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
  assignedTo?: string | { _id?: string; name?: string; email?: string; designation?: string };
  createdBy?: string | { _id?: string; name?: string; email?: string };
  comments?: string[] | TaskComment[];
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}