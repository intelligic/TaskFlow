"use client";

import { useEffect, useMemo, useState } from "react";

import { archiveTask, createTask, getTasks, updateTaskStatus, type Task, type TaskStatus } from "@/lib/api/taskApi";
import { getProjects, type Project } from "@/lib/api/projectApi";
import { getEmployees, type EmployeeItem } from "@/lib/api/employeeApi";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

type TasksResponse = { tasks: Task[] } | Task[];

export default function AdminTasksPage() {
  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewUpdatingIds, setReviewUpdatingIds] = useState<Record<string, boolean>>({});
  const [reviewError, setReviewError] = useState("");
  const [archivingIds, setArchivingIds] = useState<Record<string, boolean>>({});
  const [archiveError, setArchiveError] = useState("");

  const load = async () => {
    try {
      setError(false);
      setLoading(true);

      const [projectsRes, tasksRes, employeesRes] = await Promise.all([
        getProjects(),
        getTasks(),
        getEmployees({ role: "employee" }),
      ]);

      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setEmployees(Array.isArray(employeesRes.employees) ? employeesRes.employees : []);

      const parsed = tasksRes as TasksResponse;
      const nextTasks = Array.isArray(parsed) ? parsed : parsed.tasks;
      setTasks(Array.isArray(nextTasks) ? nextTasks : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const selectedEmployee = employees.find((emp) => emp._id === assignee);

      await createTask({
        title: title.trim(),
        description: description.trim(),
        projectId: projectId || undefined,
        assignedTo: assignee || undefined,
        assignee: selectedEmployee?.email || selectedEmployee?.name || undefined,
        priority,
        dueDate: dueDate || undefined,
      });

      setTitle("");
      setDescription("");
      setProjectId("");
      setAssignee("");
      setPriority("medium");
      setDueDate("");
      await load();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const rows = useMemo(() => tasks, [tasks]);
  const reviewTasks = useMemo(() => rows.filter((t) => t.status === "REVIEW"), [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="flex flex-col gap-1 items-start justify-start">
          <h2 className="text-lg font-bold text-black tracking-wide font-serif">Tasks</h2>
          <p className="text-[12px] font-semibold text-gray-500 tracking-wider">
            Create tasks and assign them to employees.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          Failed to load tasks
        </p>
      )}

      {!!archiveError && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          {archiveError}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b border-b-gray-100 px-4 py-3">
          <h3 className="text-[15px] font-bold text-slate-800">Create Task</h3>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 p-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Task Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Financial Reporting"
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task requirements and goals..."
              className="h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Assign Employee
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b border-b-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-slate-800">Tasks Awaiting Review</h3>
          <span className="text-xs font-semibold text-gray-600">{reviewTasks.length}</span>
        </div>

        {!!reviewError && (
          <div className="border-b border-b-gray-100 px-4 py-3 text-sm font-semibold text-red-600">
            {reviewError}
          </div>
        )}

        {loading ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">Loading...</div>
        ) : reviewTasks.length === 0 ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">No tasks in review.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {reviewTasks.map((task) => {
              const project = typeof task.projectId === "string" ? undefined : task.projectId;
              const isUpdating = !!reviewUpdatingIds[task._id];
              const attachments = Array.isArray(task.attachments) ? task.attachments : [];

              return (
                <div key={task._id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-600">
                      Project: {project?.name ?? "-"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-600">
                      Assignee: {typeof task.assignedTo === "object"
                        ? task.assignedTo?.name || task.assignedTo?.email || "-"
                        : task.assignee || "-"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-600">
                      Due: {formatDate(task.dueDate)} - Priority: {task.priority || "-"}
                    </p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold text-slate-700">Attachments</p>
                      <ul className="space-y-1">
                        {attachments.map((att, index) => {
                          const href = att.fileUrl
                            ? att.fileUrl.startsWith("http")
                              ? att.fileUrl
                              : `${backendOrigin}${att.fileUrl}`
                            : "";

                          return (
                            <li key={`${task._id}-att-${index}`} className="text-xs font-semibold">
                              {href ? (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {att.fileName || "Download file"}
                                </a>
                              ) : (
                                <span className="text-gray-600">{att.fileName || "File"}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={async () => {
                        try {
                          setReviewError("");
                          setReviewUpdatingIds((prev) => ({ ...prev, [task._id]: true }));
                          await updateTaskStatus(task._id, "COMPLETED");
                          await load();
                        } catch {
                          setReviewError("Failed to update task");
                        } finally {
                          setReviewUpdatingIds((prev) => ({ ...prev, [task._id]: false }));
                        }
                      }}
                      className="rounded bg-green-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve Task
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={async () => {
                        try {
                          setReviewError("");
                          setReviewUpdatingIds((prev) => ({ ...prev, [task._id]: true }));
                          await updateTaskStatus(task._id, "IN_PROGRESS");
                          await load();
                        } catch {
                          setReviewError("Failed to update task");
                        } finally {
                          setReviewUpdatingIds((prev) => ({ ...prev, [task._id]: false }));
                        }
                      }}
                      className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b border-b-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-slate-800">All Tasks</h3>
          <button
            type="button"
            onClick={load}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm font-semibold text-gray-600">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-5 gap-3 border-b bg-gray-100 px-4 py-3 text-[13px] font-semibold text-slate-800">
                <span>Task</span>
                <span>Project</span>
                <span>Assignee</span>
                <span>Status</span>
                <span>Due</span>
              </div>

              {rows.map((task) => {
                const project = typeof task.projectId === "string" ? undefined : task.projectId;
                const status = task.status as TaskStatus;
                const attachments = Array.isArray(task.attachments) ? task.attachments : [];
                const isArchiving = !!archivingIds[task._id];

                return (
                  <div
                    key={task._id}
                    className="grid grid-cols-5 gap-3 border-b px-4 py-3 text-[13px] font-semibold text-black last:border-b-0"
                  >
                    <div className="font-serif">
                      <div>{task.title}</div>
                      {attachments.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold">
                          {attachments.slice(0, 3).map((att, index) => {
                            const href = att.fileUrl
                              ? att.fileUrl.startsWith("http")
                                ? att.fileUrl
                                : `${backendOrigin}${att.fileUrl}`
                              : "";

                            return href ? (
                              <a
                                key={`${task._id}-list-att-${index}`}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {att.fileName || "File"}
                              </a>
                            ) : null;
                          })}
                          {attachments.length > 3 && (
                            <span className="text-gray-500">+{attachments.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-700">{project?.name ?? "-"}</span>
                    <span className="text-gray-700">
                      {typeof task.assignedTo === "object"
                        ? task.assignedTo?.name || task.assignedTo?.email || "-"
                        : task.assignee || "-"}
                    </span>
                    <span className="text-gray-700">
                      {status}
                      {status === "COMPLETED" && !task.isArchived && (
                        <button
                          type="button"
                          disabled={isArchiving}
                          onClick={async () => {
                            try {
                              setArchiveError("");
                              setArchivingIds((prev) => ({ ...prev, [task._id]: true }));
                              await archiveTask(task._id);
                              await load();
                            } catch {
                              setArchiveError("Failed to archive task");
                            } finally {
                              setArchivingIds((prev) => ({ ...prev, [task._id]: false }));
                            }
                          }}
                          className="mt-1 block rounded bg-slate-800 px-3 py-1 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isArchiving ? "Archiving..." : "Archive Task"}
                        </button>
                      )}
                    </span>
                    <span className="text-gray-700">{formatDate(task.dueDate)}</span>
                  </div>
                );
              })}

              {rows.length === 0 && (
                <div className="px-4 py-6 text-sm font-semibold text-gray-600">
                  No tasks created yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
