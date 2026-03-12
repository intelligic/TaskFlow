"use client";

import { useEffect, useMemo, useState } from "react";

import { getArchivedTasks, type Task } from "@/lib/api/taskApi";

const ITEMS_PER_PAGE = 13;

export default function AdminArchivePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      setError(false);
      setLoading(true);
      const res = await getArchivedTasks();
      setTasks(Array.isArray(res) ? res : []);
    } catch {
      setError(true);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;

    return tasks.filter((task) => {
      const projectName =
        typeof task.projectId === "string" ? "" : task.projectId?.name || "";

      const completedOn = task.updatedAt
        ? new Date(task.updatedAt).toLocaleDateString()
        : "";

      return (
        task.title.toLowerCase().includes(query) ||
        (task.assignee || "").toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query) ||
        completedOn.toLowerCase().includes(query)
      );
    });
  }, [searchTerm, tasks]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredTasks]);

  const startItem = filteredTasks.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length);

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="flex flex-col gap-1 items-start justify-start">
          <h2 className="text-lg font-bold text-black tracking-wide font-serif">
            Archived Tasks
          </h2>
          <p className="text-[12px] font-semibold text-gray-500 tracking-wider">
            A Text only Historical record of your complete and close tasks.
          </p>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by task, employee, completed or closed date..."
          className="w-full max-w-sm rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          Failed to load archived tasks
        </p>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-3 border-b border-b-gray-100 text-[14px] opacity-80 bg-gray-100 text-black text-center capatalize tracking-wide font-semibold">
          <span>Task</span>
          <span>Employee</span>
          <span>Completed On</span>
          <span>Closed On</span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">Loading...</div>
        ) : (
          paginatedTasks.map((task) => {
            const project = typeof task.projectId === "string" ? undefined : task.projectId;
            const completedOn = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "-";
            const closedOn = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "-";

            return (
              <div
                key={task._id}
                className="grid grid-cols-4 px-4 py-3 border-b border-b-gray-100 last:border-b-0 text-[12px] font-semibold text-black text-center"
              >
                <span className="text-[14px]">{task.title}</span>
                <span className="opacity-65">{task.assignee || project?.name || "-"}</span>
                <span className="opacity-65">{completedOn}</span>
                <span className="opacity-65">{closedOn}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-3 bg-white px-4 py-2 text-sm md:flex-row md:items-center md:justify-between border rounded-lg">
        <p className="text-black text-[14px] font-bold">
          Showing {startItem}-{endItem} of {filteredTasks.length} tasks
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            const active = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded border px-3 py-1.5 ${
                  active ? "border-blue-600 bg-blue-600 text-white" : "hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
