'use client';

import { useEffect, useMemo, useState } from 'react';
import { getArchivedTasks } from '@/lib/api/taskApi';
import { Task } from '@/types/task';
import { FiSearch } from 'react-icons/fi';

export default function EmployeeArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getArchivedTasks().then(res => {
      setTasks(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter(task => {
      const title = task.title.toLowerCase();
      const description = (task.description || "").toLowerCase();
      const date = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString().toLowerCase() : "";
      
      return title.includes(query) || 
             description.includes(query) || 
             date.includes(query);
    });
  }, [searchTerm, tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Archived Tasks</h2>
          <p className="text-sm text-slate-500">History of tasks you successfully completed and archived.</p>
        </div>
        <div className="relative flex items-center gap-2 outline-none focus-within:ring-1 pr-3 focus-within:ring-blue-500 border border-slate-200 rounded-md bg-white">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by task or date..."
            className="w-80 px-3 py-1.5 text-[12px] text-slate-700 outline-none rounded-md"
          />
          <FiSearch className="text-[16px] text-black" />
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b text-[11px] uppercase font-bold text-slate-600 font-serif">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3 text-right">Archived On</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-sm text-slate-400 font-medium font-serif">Loading archive...</td>
                </tr>
              )}
              {!loading && tasks.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-sm text-slate-400 font-medium font-serif">No archived tasks found.</td>
                </tr>
              )}
              {filteredTasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50 transition-colors font-serif">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900 text-sm">{task.title}</div>
                    <div className="text-xs text-slate-500">{task.description}</div>
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-slate-400 font-medium">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
