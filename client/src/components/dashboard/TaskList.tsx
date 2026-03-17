'use client';

import { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { api, getApiErrorMessage } from '@/lib/api';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      const list = Array.isArray(res.data) ? res.data : res.data.tasks;
      setTasks(list || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to load tasks'));
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          role="admin"
          onRefresh={loadTasks}
        />
      ))}
    </div>
  );
}
