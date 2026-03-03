'use client';

import { useState } from 'react';
import TaskBubble from './TaskBubble';
import ChatInput from './ChatInput';

type TaskStatus = 'pending' | 'completed' | 'closed';

type TaskMessage = {
  id: string;
  text: string;
  status: TaskStatus;
};

export default function ChatBox({ role = 'admin' }: { role?: 'admin' | 'employee' }) {
  const [tasks, setTasks] = useState<TaskMessage[]>([
    {
      id: '1',
      text: 'Please complete today’s report.',
      status: 'pending',
    },
  ]);

  const handleSendTask = (msg: string) => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: msg,
        status: 'pending',
      },
    ]);
  };

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  return (
    <div className="relative h-[calc(100vh-180px)] bg-white border rounded-lg flex flex-col overflow-hidden">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map((task) => (
          <TaskBubble
            key={task.id}
            task={task}
            role={role}
            onUpdateStatus={updateStatus}
          />
        ))}
      </div>

      {/* Fixed Bottom Input */}
      {role === 'admin' && (
        <div className="sticky bottom-0 bg-white border-t">
          <ChatInput onSend={handleSendTask} />
        </div>
      )}

      {role === 'employee' && (
        <div className="sticky bottom-0 bg-white border-t p-3 text-center text-sm text-gray-500">
          You can update task status using buttons above.
        </div>
      )}
    </div>
  );
}