"use client";

import { useEffect, useMemo, useState } from "react";
import { getArchivedTasks } from "@/lib/api/taskApi";
import { Task, TaskComment } from "@/types/task";
import { FiSearch } from "react-icons/fi";
import TaskCard from "@/components/dashboard/TaskCard";

export default function AdminArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadArchive = () => {
    setLoading(true);
    getArchivedTasks()
      .then((res) => {
        setTasks(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadArchive();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) => {
      const title = task.title.toLowerCase();
      const description = (task.description || "").toLowerCase();
      const employeeName =
        typeof task.assignedTo === "object"
          ? (task.assignedTo?.name || "").toLowerCase()
          : "";
      const date = task.updatedAt
        ? new Date(task.updatedAt).toLocaleDateString().toLowerCase()
        : "";
      const tags = (task.tags || []).join(" ").toLowerCase();

      // Search within comments
      const commentTexts = Array.isArray(task.comments)
        ? task.comments
            .map((c) => {
              if (typeof c === "string") return "";
              const comment = c as TaskComment;
              const authorName = comment.author?.name || "";
              return `${authorName} ${comment.message || ""}`.toLowerCase();
            })
            .join(" ")
        : "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        employeeName.includes(query) ||
        date.includes(query) ||
        tags.includes(query) ||
        commentTexts.includes(query)
      );
    });
  }, [searchTerm, tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-wide font-heading">
            Task Archive
          </h2>
          <p className="text-sm font-semibold font-sans text-slate-500 tracking-wide">
            Historical record of all archived tasks. Search by task, employee,
            comment, or date.
          </p>
        </div>
        <div className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm">
          <FiSearch className="text-[16px] text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, comments, employees..."
            className="w-56 md:w-72 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium">
            Loading archive...
          </div>
        ) : tasks.length === 0 ? (
          // <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium">
          //   No archived tasks found.
          // </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-between gap-8 md:grid-cols-2">
              <div className="w-130 mx-auto">
                <img
                  src="/NoTaskImg.webp"
                  className="h-80 w-full object-cover"
                  alt="NO Task Image"
                />
              </div>
              <div className="text-center md:text-left flex items-center justify-center flex-col gap-5">
                <h4 className="text-3xl font-extrabold text-slate-800">
                   No archived tasks found.
                </h4>
                <p className="text-[16px] text-slate-500 text-center">
                  Have You done a greate job Completing all your tasks! Your archive is empty because you have no completed tasks yet.
                  <br />
                  Keep up the good work and complete some tasks to see them here!
                </p>
                <link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Go to Dashboard
                </link>
              </div>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium italic">
            No tasks match your search &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              role="admin"
              onRefresh={loadArchive}
            />
          ))
        )}
      </div>
    </div>
  );
}
