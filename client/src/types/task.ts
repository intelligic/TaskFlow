export type TaskStatus = 'PENDING' | 'COMPLETED' | 'CLOSED';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}