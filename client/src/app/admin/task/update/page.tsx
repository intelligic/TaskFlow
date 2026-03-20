"use client";

import { useEffect, useState, Suspense } from "react";
import { Calendar, ChevronDown, Plus, Tag } from "lucide-react";
import { getTagClasses, TASK_TAGS } from "@/lib/task-tags";
import { useRouter, useSearchParams } from "next/navigation";
import { MdOutlineEditNote } from "react-icons/md";
import { getEmployees, type EmployeeItem } from "@/lib/api/employeeApi";
import { getTaskById, updateTask } from "@/lib/api/taskApi";

function UpdateTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const minDueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!taskId) {
        setError("No Task ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Load employees and task data in parallel
        const [empRes, taskData] = await Promise.all([
          getEmployees({ role: "employee" }),
          getTaskById(taskId)
        ]);

        if (cancelled) return;

        setEmployees(Array.isArray(empRes.employees) ? empRes.employees : []);
        
        // Pre-fill task data
        setTitle(taskData.title || "");
        setDescription(taskData.description || "");
        setAssignee(typeof taskData.assignedTo === 'object' ? taskData.assignedTo._id || "" : taskData.assignedTo || "");
        setSelectedTags(taskData.tags || []);
        
        if (taskData.dueDate) {
          // Format date for input: YYYY-MM-DD
          const date = new Date(taskData.dueDate);
          setDueDate(date.toISOString().split('T')[0]);
        }
      } catch (err) {
        if (cancelled) return;
        setError("Failed to load task details or employees");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const handleSubmit = async () => {
    if (!taskId) return;
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

      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignee,
        dueDate: dueDate || undefined,
        tags: selectedTags,
      });

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" aria-hidden />
        <div className="relative z-10 flex h-full items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-2xl">
            <p className="text-slate-500 font-medium">Loading task data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 flex h-full items-center justify-center p-6">
        <div className="w-full max-w-190 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">Update Task</h1>
        <p className="w-160 text-md text-slate-500 font-medium">
          Modify the task details and reassign if necessary.
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
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? getTagClasses(tag, "selected")
                    : getTagClasses(tag, "unselected")
                }`}
              >
                <Tag size={12} />
                {tag}
              </button>
            ))}
            {/* <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
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
            <MdOutlineEditNote className="text-2xl" />
            {submitting ? "Updating..." : "Update Task"}
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

export default function UpdateTaskPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><p className="text-slate-500">Loading...</p></div>}>
      <UpdateTaskContent />
    </Suspense>
  );
}
