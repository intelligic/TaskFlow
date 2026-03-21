"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Plus, Tag } from "lucide-react";
import { getTagClasses, TASK_TAGS } from "@/lib/task-tags";
import { useRouter } from "next/navigation";
import { MdOutlineAddTask } from "react-icons/md";
import { getEmployees, type EmployeeItem } from "@/lib/api/employeeApi";
import { createTask } from "@/lib/api/taskApi";

export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const minDueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  const toggleTag = (tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getEmployees({ role: "employee" });
        if (cancelled) return;
        setEmployees(Array.isArray(res.employees) ? res.employees : []);
      } catch {
        if (cancelled) return;
        setError("Failed to load employees");
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

  const handleSubmit = async () => {
    if (!title.trim() || !assignee) {
      setError("Title and Assignee are required");
      return;
    }

    if (dueDate && dueDate < minDueDate) {
      setError("Due date cannot be in the past");
      return;
    }

    try {
      setError("");
      setSubmitting(true);

      await createTask({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignee,
        dueDate: dueDate || undefined,
        tags: selectedTag ? [selectedTag] : [],
      });

      setTitle("");
      setDescription("");
      setAssignee("");
      setDueDate("");
      setSelectedTag(null);
      router.push("/admin/dashboard");
    } catch {
      setError("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 flex h-full items-center justify-center p-6">
        <div className="w-full max-w-190 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Create New Task</h1>
        <p className="w-160 text-md text-slate-500 font-medium">
          Set up a new project task and assign it to a team member.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Task Title</label>
          <input
            type="text"
            placeholder="e.g. Q4 Financial Reporting"
            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            placeholder="Describe the task requirements and goals..."
            className="h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Assign To</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                disabled={loading}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Due Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-10 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={minDueDate}
              />
              <Calendar size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Tags</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TASK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                  selectedTag === tag ? getTagClasses(tag, "selected") : getTagClasses(tag, "unselected")
                }`}
              >
                <Tag size={12} />
                {tag}
              </button>
            ))}
            {/* <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
            >
              <Plus size={12} />
              Add New
            </button> */}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg tracking-wide bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MdOutlineAddTask className="text-lg" />
            {submitting ? "Creating..." : "Create Task"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-medium text-slate-400">
        Notifications will be sent to the assigned employee automatically.
      </p>
        </div>
      </div>
    </div>
  );
}
