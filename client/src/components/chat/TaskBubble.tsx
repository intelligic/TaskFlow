'use client';

import { Calendar, Tag } from 'lucide-react';
import { getTagClasses } from '@/lib/task-tags';

type TaskStatus = 'pending' | 'completed' | 'closed';

export default function TaskBubble({
  task,
  role,
  onUpdateStatus,
}: {
  task: { id: string; text: string; status: TaskStatus; dueDate?: string; tags?: string[] };
  role: 'admin' | 'employee';
  onUpdateStatus: (id: string, status: TaskStatus) => void;
}) {
  const isPending = task.status === 'pending';
  const isCompleted = task.status === 'completed';
  const isClosed = task.status === 'closed';
  return (
    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
      <p className="whitespace-pre-wrap wrap-break-word text-sm font-medium text-black">{task.text}</p>

      {(task.dueDate || (task.tags && task.tags.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.tags && task.tags.length > 0 && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${getTagClasses(task.tags[0], 'badge')}`}>
              <Tag size={12} />
              {task.tags[0]}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        {/* Pending */}
        <button
          onClick={() => role === 'admin' && onUpdateStatus(task.id, 'pending')}
          disabled={!(role === 'admin' && !isPending)}
          className={`rounded px-3 py-1 text-[14px] ${
            isPending
              ? 'bg-red-600 text-white'
              : role === 'admin'
              ? 'bg-red-100 text-red-400 hover:bg-red-200'
              : 'bg-red-100 text-red-400 cursor-not-allowed opacity-70'
          }`}
        >
          Pending
        </button>

        {/* Complete (Employee action) */}
        <button
          onClick={() => role === 'employee' && onUpdateStatus(task.id, 'completed')}
          disabled={!(role === 'employee' && isPending)}
          className={`rounded px-3 py-1 text-[14px] ${
            isCompleted
              ? 'bg-blue-600 text-white'
              : role === 'employee' && isPending
              ? 'bg-blue-100 text-blue-400 hover:bg-blue-200'
              : 'bg-blue-100 text-blue-400 cursor-not-allowed opacity-70'
          }`}
        >
          Complete
        </button>

        {/* Close (Admin action) */}
        <button
          onClick={() => role === 'admin' && onUpdateStatus(task.id, 'closed')}
          disabled={!(role === 'admin' && isCompleted)}
          className={`rounded px-3 py-1 text-[14px] ${
            isClosed
              ? 'bg-green-600 text-white'
              : role === 'admin' && isCompleted
              ? 'bg-green-100 text-green-400 hover:bg-green-200'
              : 'bg-green-100 text-green-400 cursor-not-allowed opacity-70'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
