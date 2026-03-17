'use client';

import { useEffect, useMemo, useState } from 'react';
import { getArchivedTasks } from '@/lib/api/taskApi';
import { Task, TaskComment } from '@/types/task';
import { FiSearch } from 'react-icons/fi';
import TaskCard from '@/components/dashboard/TaskCard';

export default function AdminArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadArchive = () => {
    setLoading(true);
    getArchivedTasks().then(res => {
      setTasks(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadArchive();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter(task => {
      const title = task.title.toLowerCase();
      const description = (task.description || "").toLowerCase();
      const employeeName = typeof task.assignedTo === 'object' ? (task.assignedTo?.name || "").toLowerCase() : "";
      const date = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString().toLowerCase() : "";
      const tags = (task.tags || []).join(" ").toLowerCase();

      // Search within comments
      const commentTexts = Array.isArray(task.comments)
        ? task.comments.map((c) => {
            if (typeof c === 'string') return '';
            const comment = c as TaskComment;
            const authorName = comment.author?.name || '';
            return `${authorName} ${comment.message || ''}`.toLowerCase();
          }).join(' ')
        : '';

      return title.includes(query) || 
             description.includes(query) || 
             employeeName.includes(query) || 
             date.includes(query) ||
             tags.includes(query) ||
             commentTexts.includes(query);
    });
  }, [searchTerm, tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Task Archive</h2>
          <p className="text-sm text-slate-500">Historical record of all archived tasks. Search by task, employee, comment, or date.</p>
        </div>
        <div className="relative flex items-center gap-2 outline-none focus-within:ring-1 pr-3 focus-within:ring-blue-500 border border-slate-200 rounded-md bg-white">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, comments, employees..."
            className="w-80 px-3 py-1.5 text-[12px] text-slate-700 outline-none rounded-md"
          />
          <FiSearch className="text-[16px] text-black" />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium">
            Loading archive...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium">
            No archived tasks found.
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium italic">
            No tasks match your search &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} role="admin" onRefresh={loadArchive} />
          ))
        )}
      </div>
    </div>
  );
}
