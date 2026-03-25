"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import TaskBubble from "./TaskBubble";
import ChatInput from "./ChatInput";
import { socket } from "@/lib/socket";
import { createTask, getTasks, updateTaskStatus } from "@/lib/api/taskApi";
import { Task } from "@/types/task";

export type ChatTaskStatus = "pending" | "completed" | "closed";

type TaskMessage = {
  id: string;
  type: "task";
  text: string;
  description?: string;
  status: ChatTaskStatus;
  dueDate?: string;
  createdAt?: string;
  tags?: string[];
  comments?: Task["comments"];
  attachments?: {
    name: string;
    url: string;
    mimeType?: string;
    size?: number;
  }[];
};

type ChatMessage = TaskMessage;

function mapStatus(status?: string, isArchived?: boolean): ChatTaskStatus {
  if (isArchived) return "closed";
  const value = String(status || "").toLowerCase();
  if (value === "closed") return "closed";
  if (value === "completed" || value === "done") return "completed";
  return "pending";
}

export default function ChatBox({
  role = "admin",
  conversationKey = "employee-1",
  targetEmployeeId,
  searchTerm = "",
}: {
  role?: "admin" | "employee";
  conversationKey?: string;
  targetEmployeeId?: string;
  searchTerm?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeText = (value: string) => {
    return value.toLowerCase().replace(/[^a-z0-9]+/gi, " ").trim();
  };

  const getQueryTokens = (value: string) => {
    const normalized = normalizeText(value);
    return normalized.split(/\s+/).filter(Boolean);
  };

  const getDateTokens = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).toLowerCase();
    return [
      value,
      date.toISOString(),
      date.toLocaleDateString(),
      date.toLocaleString(),
    ]
      .join(" ")
      .toLowerCase();
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res =
        role === "employee"
          ? await getTasks()
          : await getTasks({
              assignedTo: targetEmployeeId,
            });
      const list = Array.isArray(res) ? res : (res as { tasks: Task[] }).tasks;
      const items = (list || []).map((task) => ({
        id: task._id,
        type: "task" as const,
        text: task.title,
        description: task.description,
        status: mapStatus(task.status, task.isArchived),
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        tags: task.tags,
        comments: task.comments,
        attachments: task.attachments || [],
      }));
      setMessages(items);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    const handleRefresh = () => {
      loadTasks();
    };

    socket.on("taskCreated", handleRefresh);
    socket.on("taskUpdated", handleRefresh);
    socket.on("taskDeleted", handleRefresh);

    return () => {
      socket.off("taskCreated", handleRefresh);
      socket.off("taskUpdated", handleRefresh);
      socket.off("taskDeleted", handleRefresh);
    };
  }, [conversationKey]);

  const handleSendTask = async (msg: string, files: File[] = [], dueDate?: string, tags?: string[]) => {
    const title = msg.trim() || (files.length > 0 ? "Voice note" : "");
    if (!title && files.length === 0) return;
    if (role !== "admin") return;

    try {
      if (targetEmployeeId) {
        await createTask(
          {
            title,
            assignedTo: targetEmployeeId,
            dueDate,
            tags,
          },
          files,
        );
        await loadTasks();
      }
    } catch {
      // ignore for now
    }
  };

  const updateStatus = async (id: string, status: ChatTaskStatus) => {
    try {
      setMessages((prev) =>
        prev.map((item) =>
          item.type === "task" && item.id === id ? { ...item, status } : item,
        ),
      );
      await updateTaskStatus(id, status);
      await loadTasks();
    } catch {
      // ignore for now
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col rounded-lg overflow-visible">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-2 text-sm font-semibold text-gray-600">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-between gap-8 md:grid-cols-2">
              <div className="w-130 mx-auto">
                <Image
                  src="/NoTaskImg.webp"
                  width={420}
                  height={320}
                  className="h-80 w-full object-cover"
                  alt="No tasks"
                />
              </div>
              <div className="text-center md:text-left flex items-center justify-center flex-col gap-5">
                <h4 className="text-3xl font-extrabold text-slate-800">No tasks yet.</h4>
                <p className="text-[16px] text-slate-500 text-center">
                  You currently have no tasks assigned to you.
                  <br />
                  Enjoy your productive day!
                </p>
                <button
                  onClick={loadTasks}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        ) : (
          (searchTerm
            ? messages.filter((item) => {
                const normalizedQuery = normalizeText(searchTerm);
                const tokens = getQueryTokens(searchTerm);
                if (!normalizedQuery || tokens.length === 0) return true;
                const title = item.text?.toLowerCase() || "";
                const description = item.description?.toLowerCase() || "";
                const tags = (item.tags || []).join(" ").toLowerCase();
                const dateText = getDateTokens(item.dueDate);
                const createdText = getDateTokens(item.createdAt);
                const commentText = Array.isArray(item.comments)
                  ? item.comments
                      .map((comment) => {
                        if (!comment || typeof comment === "string") return "";
                        const author = comment.author?.name || "";
                        const message = comment.message || "";
                        const commentDate = getDateTokens(comment.createdAt);
                        return `${author} ${message} ${commentDate}`.toLowerCase();
                      })
                      .join(" ")
                  : "";

                const haystack = normalizeText(
                  [
                    title,
                    description,
                    tags,
                    dateText,
                    createdText,
                    commentText,
                  ].join(" "),
                );

                return (
                  haystack.includes(normalizedQuery) ||
                  tokens.some((token) => haystack.includes(token))
                );
              })
            : messages
          ).map((item) => (
            <TaskBubble key={item.id} task={item} role={role} onUpdateStatus={updateStatus} />
          ))
        )}
      </div>

      {role === "admin" && (
        <div className="shrink-0 border-t bg-white relative z-50 mt-2">
          <ChatInput onSend={handleSendTask} />
        </div>
      )}

      {role === "employee" && (
        <div className="shrink-0 border-t bg-white p-3 text-center text-sm text-gray-500">
          You can update task status using buttons above.
        </div>
      )}
    </div>
  );
}
