'use client';

type TaskStatus = 'pending' | 'completed' | 'closed';

export default function TaskBubble({
  task,
  role,
  onUpdateStatus,
}: {
  task: { id: string; text: string; status: TaskStatus };
  role: 'admin' | 'employee';
  onUpdateStatus: (id: string, status: TaskStatus) => void;
}) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
      <p className="text-sm">{task.text}</p>

      <div className="flex items-center gap-2 text-xs">
        {/* Pending */}
        <button
          disabled
          className={`px-2 py-1 rounded ${
            task.status === 'pending'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-400 cursor-not-allowed'
          }`}
        >
          Pending
        </button>

        {/* Complete (Employee action) */}
        <button
          onClick={() => role === 'employee' && onUpdateStatus(task.id, 'completed')}
          disabled={!(role === 'employee' && task.status === 'pending')}
          className={`px-2 py-1 rounded ${
            task.status === 'completed'
              ? 'bg-blue-600 text-white'
              : role === 'employee' && task.status === 'pending'
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-blue-50 text-blue-300 cursor-not-allowed'
          }`}
        >
          Complete
        </button>

        {/* Close (Admin action) */}
        <button
          onClick={() => role === 'admin' && onUpdateStatus(task.id, 'closed')}
          disabled={!(role === 'admin' && task.status === 'completed')}
          className={`px-2 py-1 rounded ${
            task.status === 'closed'
              ? 'bg-green-600 text-white'
              : role === 'admin' && task.status === 'completed'
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-green-50 text-green-300 cursor-not-allowed'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}