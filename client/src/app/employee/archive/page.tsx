'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTasks, type Task } from '@/lib/api/taskApi';

const ITEMS_PER_PAGE = 13;

type ArchiveRow = {
  id: string;
  title: string;
  completedAt: string;
  closedAt: string;
};

export default function EmployeeArchivePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<ArchiveRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getTasks({ assignedTo: 'currentUser', archived: true });
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res as { tasks: Task[] }).tasks;
        const mapped = (list || []).map((task) => {
          const updated = task.updatedAt || task.createdAt || '';
          const formatted = updated ? new Date(updated).toLocaleDateString() : '-';
          return {
            id: task._id,
            title: task.title,
            completedAt: formatted,
            closedAt: formatted,
          };
        });
        setTasks(mapped);
      } catch {
        if (cancelled) return;
        setTasks([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.completedAt.toLowerCase().includes(query) ||
        task.closedAt.toLowerCase().includes(query),
    );
  }, [searchTerm, tasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTasks = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, safePage]);

  const startItem = filteredTasks.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredTasks.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="flex flex-col gap-1 items-start justify-start">
          <h2 className="text-2xl font-bold text-black tracking-wide">Employee Task Archive</h2>
          <p className="text-[12px] font-semibold text-gray-500 tracking-wider">
            A text-only historical record of your completed tasks.
          </p>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by task or date..."
          className="w-full max-w-sm rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-3 border-b border-b-gray-100 text-[14px] opacity-70 bg-gray-100 text-black text-center uppercase tracking-wide font-semibold">
          <span>Task</span>
          <span>Completed On</span>
          <span>Closed On</span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">Loading...</div>
        ) : paginatedTasks.length === 0 ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">No archived tasks.</div>
        ) : (
          paginatedTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-3 px-4 py-3 border-b border-b-gray-100 last:border-b-0 text-[12px] font-semibold text-black text-center"
            >
              <span>{task.title}</span>
              <span className="opacity-65">{task.completedAt}</span>
              <span className="opacity-65">{task.closedAt}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 bg-white px-4 py-2 text-sm md:flex-row md:items-center md:justify-between border rounded-lg">
        <p className="text-black text-[14px] font-bold">
          Showing {startItem}-{endItem} of {filteredTasks.length} tasks
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safePage === 1}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            const active = page === safePage;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded border px-3 py-1.5 ${
                  active ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={safePage === totalPages}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
