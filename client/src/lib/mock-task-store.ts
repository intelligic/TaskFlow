import type { Task, TaskStatus } from '@/types/task';

type GlobalWithMockTasks = typeof globalThis & {
  __mockTasks?: Task[];
};

const globalWithMockTasks = globalThis as GlobalWithMockTasks;

function createSeedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: 't1',
      title: 'Prepare daily update',
      description: 'Share task progress in the team group.',
      status: 'PENDING',
      createdAt: now,
    },
    {
      id: 't2',
      title: 'Review assigned tasks',
      description: 'Check pending and completed items.',
      status: 'COMPLETED',
      createdAt: now,
    },
    {
      id: 't3',
      title: 'Close outdated ticket',
      description: 'Archive the old completed task.',
      status: 'CLOSED',
      createdAt: now,
    },
  ];
}

function ensureStore(): Task[] {
  if (!globalWithMockTasks.__mockTasks) {
    globalWithMockTasks.__mockTasks = createSeedTasks();
  }
  return globalWithMockTasks.__mockTasks;
}

export function getTasks(): Task[] {
  return ensureStore();
}

export function getMyTasks(): Task[] {
  return ensureStore();
}

export function updateTaskStatus(id: string, status: TaskStatus): Task | null {
  const tasks = ensureStore();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;

  tasks[index] = { ...tasks[index], status };
  return tasks[index];
}
