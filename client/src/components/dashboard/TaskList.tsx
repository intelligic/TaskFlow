'use client';

import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { api, getApiErrorMessage } from '@/lib/api';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Unable to load tasks'));
      }
    };
    loadTasks();
  }, []);

  const updateStatus = async (id: string, status: TaskStatus) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to update task status'));
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          role="admin"
          onUpdateStatus={updateStatus}
        />
      ))}
    </div>
  );
}
