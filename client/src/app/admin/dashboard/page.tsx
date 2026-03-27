"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PlayCircle, CheckCircle2, Users, Activity, X } from "lucide-react";
import Image from "next/image";
import { getDashboardStats, type DashboardStats } from "@/lib/api/dashboardApi";
import { getEmployees, type EmployeeItem } from "@/lib/api/employeeApi";
import { getProfile } from "@/lib/api/authApi";
import { getTasks, createTask } from "@/lib/api/taskApi";
import { socket } from "@/lib/socket";
import { RiArrowDownBoxFill, RiArrowUpBoxFill } from "react-icons/ri";
import { Task } from "@/types/task";
import TaskCard from "@/components/dashboard/TaskCard";
import { FiSearch } from "react-icons/fi";
import { Tag } from "lucide-react";
import { getTagClasses, TASK_TAGS } from "@/lib/task-tags";
import { isRecentlyActive } from "@/lib/online";

const ITEMS_PER_PAGE = 5;

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      const [statsRes, employeesRes, profileRes, tasksRes] = await Promise.all([
        getDashboardStats(),
        getEmployees({ role: "employee" }),
        getProfile(),
        getTasks(),
      ]);

      setStats(statsRes);
      setEmployees(
        Array.isArray(employeesRes.employees) ? employeesRes.employees : [],
      );
      setWorkspaceName(profileRes?.workspace?.name || "");
      setTasks(tasksRes.tasks || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Connection is handled by ProtectedRoute; just register listeners.
    socket.on("taskCreated", loadData);
    socket.on("taskUpdated", loadData);
    socket.on("taskDeleted", loadData);
    socket.on("userStatusUpdated", loadData);

    return () => {
      socket.off("taskCreated", loadData);
      socket.off("taskUpdated", loadData);
      socket.off("taskDeleted", loadData);
      socket.off("userStatusUpdated", loadData);
    };
  }, []);

  // Listen for navbar trigger
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener("open-task-modal", handleOpenModal);

    // Check search params
    if (searchParams.get("create") === "true") {
      setIsModalOpen(true);
      // Clean up URL
      router.replace("/admin/dashboard");
    }

    return () => window.removeEventListener("open-task-modal", handleOpenModal);
  }, [searchParams, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) {
      setFormError("Title and Assignee are required");
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");
      await createTask({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assigneeId,
        dueDate: dueDate || undefined,
        tags: selectedTags,
      });

      await loadData();
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setSelectedTags([]);
      setSuccessMessage("Task created successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError("Failed to create task");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        (emp.designation || "").toLowerCase().includes(query),
    );
  }, [searchTerm, employees]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredEmployees]);

  const recentTasks = useMemo(() => {
    const query = taskSearchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) => {
      const title = task.title.toLowerCase();
      const description = (task.description || "").toLowerCase();
      const tags = (task.tags || []).join(" ").toLowerCase();
      const assigneeName =
        typeof task.assignedTo === "object"
          ? (task.assignedTo.name || "").toLowerCase()
          : "";
      const assigneeEmail =
        typeof task.assignedTo === "object"
          ? (task.assignedTo.email || "").toLowerCase()
          : "";
      const dueDateText = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString().toLowerCase()
        : "";
      const createdText = task.createdAt
        ? new Date(task.createdAt).toLocaleDateString().toLowerCase()
        : "";

      return (
        title.includes(query) ||
        description.includes(query) ||
        tags.includes(query) ||
        assigneeName.includes(query) ||
        assigneeEmail.includes(query) ||
        dueDateText.includes(query) ||
        createdText.includes(query)
      );
    });
  }, [tasks, taskSearchTerm]);

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden pb-4">
      <div className="w-full">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-wide font-heading">
            Admin Dashboard
          </h2>
          <p className="text-sm font-semibold font-sans text-slate-500 tracking-wide">
            {workspaceName || "Workspace"} overview
          </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-green-100 border border-green-200 px-4 py-3 text-sm font-bold text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          Failed to load dashboard data
        </p>
      )}

      <div className="grid flex-none grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          className="text-md text-black"
          title="Total Tasks"
          value={stats?.totalTasks ?? 0}
          icon={<PlayCircle className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-100"
        />
        <SummaryCard
          className="text-md text-black"
          title="Completed Tasks"
          value={stats?.completedTasks ?? 0}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
        />
        <SummaryCard
          className="text-md text-black"
          title="Active Employees"
          value={stats?.activeEmployees ?? 0}
          icon={<Activity className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <SummaryCard
          className="text-md text-black"
          title="Total Employees"
          value={stats?.totalEmployees ?? 0}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
      </div>

      <div className="w-full flex-1 flex flex-wrap flex-col md:flex-row justify-between gap-10  min-h-0">
        {/* Recent Tasks Section */}
        <div className="flex flex-1 w-full min-h-0 h-full flex-col gap-4 rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-100">
          <div className="flex items-center justify-between rounded-t-2xl bg-slate-400/70 px-5 py-2">
            <h3 className="text-[16px] font-extrabold text-slate-800 uppercase tracking-wide">
              Recent Tasks
            </h3>
            <div className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm min-w-0">
              <FiSearch className="text-[16px] text-black flex-shrink-0" />
              <input
                type="text"
                value={taskSearchTerm}
                onChange={(e) => setTaskSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full max-w-[200px] sm:max-w-xs bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {loading ? (
              <p className="text-sm text-slate-500 font-medium">
                Loading tasks...
              </p>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="grid w-full max-w-5xl grid-cols-1 items-center justify-between gap-8 md:grid-cols-2">
                  <div className="w-full max-w-sm mx-auto">
                    <Image
                      src="/NoTaskImg.webp"
                      width={420}
                      height={320}
                      className="h-80 w-full object-cover"
                      alt="No tasks"
                    />
                  </div>
                  <div className="text-center md:text-left flex items-center justify-center flex-col gap-5">
                    <h4 className="text-2xl font-extrabold text-slate-800">
                      No tasks assigned yet
                    </h4>
                    <p className="text-[14px] text-slate-500 text-center">
                      You currently have no tasks assigned to you.
                      <br />
                      Enjoy your productive day!
                    </p>
                    <button
                      onClick={loadData}
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              recentTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  role="admin"
                  onRefresh={loadData}
                />
              ))
            )}
          </div>
        </div>

        {/* Employees Section */}
        <div className="flex w-full lg:w-[450px] min-h-0 flex-col gap-4 rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-100">
          <div className="flex items-center justify-between rounded-t-2xl bg-slate-400/70 px-5 py-2">
            <h3 className="text-[16px] font-extrabold text-slate-800 uppercase tracking-wide">
              Employees
            </h3>
            <div className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm min-w-0">
              <FiSearch className="text-[16px] text-black flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full max-w-[120px] sm:max-w-[180px] bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            <div className="divide-y">
              {paginatedEmployees.length === 0 ? (
                <div className="px-4 py-6 text-sm font-semibold text-slate-600">
                  No employees found
                </div>
              ) : (
                paginatedEmployees.map((emp) => {
                  const online = isRecentlyActive(emp.lastActive, emp.isOnline);
                  return (
                    <div
                      key={emp._id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-200"
                      onClick={() =>
                        router.push(`/admin/chat/${emp.slug || emp._id}`)
                      }
                    >
                      <div className="w-full sm:w-1/3 text-left">
                        <p className="text-[14px] font-bold text-slate-900">
                          {emp.name}
                        </p>
                      </div>
                      <div className="w-full sm:w-1/3 flex justify-start sm:justify-center items-center gap-3">
                        <span className="text-slate-700 text-[14px] font-bold flex items-center gap-1">
                          <RiArrowDownBoxFill size={16} className="text-red-500 h-4 w-4 sm:h-5 sm:w-5" />
                          {emp.pending ?? 0}
                        </span>
                        <span className="text-slate-700 text-[14px] font-bold flex items-center gap-1">
                          <RiArrowUpBoxFill size={16} className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />
                          {emp.completed ?? 0}
                        </span>
                      </div>
                      <div className="w-full sm:w-1/3 text-right flex items-center justify-start sm:justify-end gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-slate-300"}`}
                        ></span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${online ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {online ? "Active" : "Offline"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Create New Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Assign To
                  </label>
                  <select
                    required
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">Select</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {TASK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                        selectedTags.includes(tag)
                          ? getTagClasses(tag, "selected")
                          : getTagClasses(tag, "unselected")
                      }`}
                    >
                      <Tag size={10} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {formError && (
                <p className="text-xs font-bold text-red-600">{formError}</p>
              )}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconBg,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border-gray-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 ${className}`}
    >
      <div>
        <p className="text-[16px] font-extrabold text-slate-800 uppercase tracking-wide">
          {title}
        </p>
        <p className="mt-2 text-2xl font-black text-slate-900 leading-none">
          {value}
        </p>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}
