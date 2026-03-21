"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ChatBox from "@/components/chat/ChatBox";
import { getEmployeeBySlug } from "@/lib/api/employeeApi";
import { getTasks } from "@/lib/api/taskApi";
import { Task, TaskComment } from "@/types/task";
import TaskCard from "@/components/dashboard/TaskCard";
import { FiSearch } from "react-icons/fi";
import { MessageSquare } from "lucide-react";
import { socket } from "@/lib/socket";

type Props = {
  params: { slug: string } | Promise<{ slug: string }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminChatPage({ params }: Props) {
  const [slug, setSlug] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [employee, setEmployee] = useState<{
    name: string;
    designation?: string;
    lastActive?: string;
    isOnline?: boolean;
  }>({
    name: "Employee",
    designation: "",
    isOnline: false,
  });
  const [loading, setLoading] = useState(true);

  // Task-related state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [chatSearchTerm, setChatSearchTerm] = useState("");
  const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);

  useEffect(() => {
    Promise.resolve(params).then((resolved) => setSlug(resolved.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeBySlug(slug);
        if (cancelled) return;
        setEmployee({
          name: res.name || "Employee",
          designation: res.designation || "",
          lastActive: res.lastActive,
          isOnline: res.isOnline,
        });
        setEmployeeId(res._id);
      } catch {
        if (cancelled) return;
        setEmployee({ name: `Employee ${slug}`, designation: "" });
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Load tasks assigned to this employee
  const loadTasks = useCallback(async () => {
    if (!employeeId) return;
    try {
      setTasksLoading(true);
      const res = await getTasks({ assignedTo: employeeId });
      const list = res.tasks || (Array.isArray(res) ? res : []);
      setTasks(list);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId && showTasks) {
      loadTasks();
    }
  }, [employeeId, showTasks, loadTasks]);

  useEffect(() => {
    if (!employeeId) return;

    // Connection handled by ProtectedRoute; only register listener.
    const handleNewComment = () => {
      if (showTasks) {
        loadTasks();
        setCommentsRefreshKey((prev) => prev + 1);
      }
    };

    socket.on("newComment", handleNewComment);

    return () => {
      socket.off("newComment", handleNewComment);
    };
  }, [employeeId, showTasks, loadTasks]);

  useEffect(() => {
    if (!employeeId) return;

    // Connection handled by ProtectedRoute; only register listener.
    const handleStatusUpdated = (updated: {
      _id?: string;
      name?: string;
      designation?: string;
      lastActive?: string;
      isOnline?: boolean;
    }) => {
      if (!updated?._id || String(updated._id) !== String(employeeId)) return;
      setEmployee((prev) => ({
        ...prev,
        name: updated.name || prev.name,
        designation: updated.designation ?? prev.designation,
        lastActive: updated.lastActive || prev.lastActive,
        isOnline: Boolean(updated.isOnline),
      }));
    };

    socket.on("userStatusUpdated", handleStatusUpdated);

    return () => {
      socket.off("userStatusUpdated", handleStatusUpdated);
    };
  }, [employeeId]);

  const filteredTasks = useMemo(() => {
    const query = taskSearchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) => {
      const title = task.title.toLowerCase();
      const description = (task.description || "").toLowerCase();
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
        tags.includes(query) ||
        commentTexts.includes(query)
      );
    });
  }, [taskSearchTerm, tasks]);

  const conversationKey = useMemo(() => {
    if (!employeeId) return "";
    return `employee-${employeeId}`;
  }, [employeeId]);

  const online = employee.isOnline;

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-0 flex-col gap-6 overflow-visible pb-2">
      <div className="flex items-center justify-between rounded-lg bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center text-[22px] justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {getInitials(employee.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">
              Chat with {employee.name}
            </h2>
            <p className="text-[12px] font-semibold tracking-wide text-gray-500">
              {employee.designation || "Employee"}
              <span className="mx-2">|</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  online
                    ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                }`}
              >
                {online ? "Online" : "Offline"}
              </span>
            </p>
          </div>
        </div>

        {/* Toggle Tasks Button */}
        <button
          onClick={() => setShowTasks(!showTasks)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            showTasks
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MessageSquare size={14} />
          {showTasks ? "Hide Tasks & Comments" : "View Tasks & Comments"}
        </button>
      </div>

      {!showTasks && (
        <div className="flex items-center justify-end">
          <div className="relative flex items-center gap-2 outline-none focus-within:ring-1 pr-3 focus-within:ring-blue-500 border border-slate-200 rounded-md bg-white">
            <input
              type="text"
              value={chatSearchTerm}
              onChange={(e) => setChatSearchTerm(e.target.value)}
              placeholder="Search chat by title, description, date, tag..."
              className="w-72 px-3 py-1.5 text-[12px] text-slate-700 outline-none rounded-md"
            />
            <FiSearch className="text-[16px] text-black" />
          </div>
        </div>
      )}

      {showTasks ? (
        /* Tasks with Comments View */
        <div className="min-h-0 flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between flex-none">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Tasks assigned to {employee.name}
            </h3>
            <div className="relative flex items-center gap-2 outline-none focus-within:ring-1 pr-3 focus-within:ring-blue-500 border border-slate-200 rounded-md bg-white">
              <input
                type="text"
                value={taskSearchTerm}
                onChange={(e) => setTaskSearchTerm(e.target.value)}
                placeholder="Search tasks, comments..."
                className="w-64 px-3 py-1.5 text-[12px] text-slate-700 outline-none rounded-md"
              />
              <FiSearch className="text-[16px] text-black" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {tasksLoading ? (
              <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium">
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium italic">
                No tasks assigned to this employee.
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-lg border bg-white px-4 py-8 text-center text-sm text-slate-400 font-medium italic">
                No tasks match your search &quot;{taskSearchTerm}&quot;.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  role="admin"
                  onRefresh={loadTasks}
                  commentsRefreshKey={commentsRefreshKey}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Chat View */
        <div className="min-h-0 flex-1">
          {!loading && conversationKey ? (
            <ChatBox
              conversationKey={conversationKey}
              role="admin"
              targetEmployeeId={employeeId}
              searchTerm={chatSearchTerm}
            />
          ) : (
            <div className="text-sm font-semibold text-gray-600">
              Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
