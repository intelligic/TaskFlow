'use client';

import { Task, TaskStatus } from '@/types/task';

type Props = {
  task: Task;
  onUpdateStatus?: (id: string, status: TaskStatus) => void;
  role: 'admin' | 'employee';
};

export default function TaskCard({ task, onUpdateStatus, role }: Props) {
  const isPending = task.status === 'PENDING';
  const isCompleted = task.status === 'COMPLETED';
  const isClosed = task.status === 'CLOSED';

  return (
    <div className="border rounded p-4 space-y-3">
      <div>
        <p className="font-medium">{task.title}</p>
        <p className="text-sm text-gray-500">{task.description}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Pending */}
        <button
          disabled={isPending}
          className={`px-3 py-1 text-sm rounded 
            ${isPending ? 'bg-red-500 text-white' : 'bg-red-100 text-red-400'}`}
        >
          Pending
        </button>

        {/* Completed */}
        <button
          disabled={isCompleted}
          onClick={() => onUpdateStatus?.(task.id, 'COMPLETED')}
          className={`px-3 py-1 text-xs rounded 
            ${isCompleted ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-400'}`}
        >
          Completed
        </button>

        {/* Closed (Admin only) */}
        {role === 'admin' && (
          <button
            disabled={isClosed}
            onClick={() => onUpdateStatus?.(task.id, 'CLOSED')}
            className={`px-3 py-1 text-xs rounded 
              ${isClosed ? 'bg-green-500 text-white' : 'bg-green-100 text-green-400'}`}
          >
            Closed
          </button>
        )}
      </div>
    </div>
  );
}