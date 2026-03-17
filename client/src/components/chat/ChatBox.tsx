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
  status: ChatTaskStatus;
  dueDate?: string;
  tags?: string[];
};

type AttachmentMessage = {
  id: string;
  type: "attachment";
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

type ChatMessage = TaskMessage | AttachmentMessage;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

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
}: {
  role?: "admin" | "employee";
  conversationKey?: string;
  targetEmployeeId?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks({
        assignedTo: role === "employee" ? "currentUser" : targetEmployeeId,
      });
      const list = Array.isArray(res) ? res : (res as { tasks: Task[] }).tasks;
      const items = (list || []).map((task) => ({
        id: task._id,
        type: "task" as const,
        text: task.title,
        status: mapStatus(task.status, task.isArchived),
        dueDate: task.dueDate,
        tags: task.tags,
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
    const nextMessages: ChatMessage[] = [];
    const ts = Date.now();

    if (msg.trim() && role === "admin") {
      try {
        if (targetEmployeeId) {
          await createTask({
            title: msg.trim(),
            assignedTo: targetEmployeeId,
            dueDate,
            tags
          });
          await loadTasks();
        }
      } catch {
        // ignore for now
      }
    }

    if (files.length > 0) {
      const attachmentPayloads = await Promise.all(
        files.map(async (file, index) => ({
          id: `${ts}-file-${index}`,
          type: "attachment" as const,
          name: file.name,
          url: await fileToDataUrl(file),
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        })),
      );

      nextMessages.push(...attachmentPayloads);
    }

    if (nextMessages.length === 0) return;
    setMessages((prev) => [...prev, ...nextMessages]);
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
    <div className="relative flex h-full min-h-0 flex-col rounded-lg bg-white overflow-visible">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-2 text-sm font-semibold text-gray-600">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="px-3 py-2 text-sm font-semibold text-gray-600">No tasks yet.</div>
        ) : (
          messages.map((item) =>
            item.type === "task" ? (
              <TaskBubble key={item.id} task={item} role={role} onUpdateStatus={updateStatus} />
            ) : (
              <AttachmentBubble key={item.id} item={item} />
            ),
          )
        )}
      </div>

      {role === "admin" && (
        <div className="shrink-0 border-t bg-white relative z-50">
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

function AttachmentBubble({ item }: { item: AttachmentMessage }) {
  const isImage = item.mimeType.startsWith("image/");
  const isAudio = item.mimeType.startsWith("audio/");
  const prettySize =
    item.size < 1024 * 1024
      ? `${Math.max(1, Math.round(item.size / 1024))} KB`
      : `${(item.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-xl rounded-lg border bg-slate-50 p-3">
      {isImage ? (
        <a href={item.url} target="_blank" rel="noreferrer" className="block">
          <div className="relative h-64 w-full max-w-xl overflow-hidden rounded-md bg-white">
            <Image
              src={item.url}
              alt={item.name}
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        </a>
      ) : isAudio ? (
        <audio controls className="w-full">
          <source src={item.url} type={item.mimeType} />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <a
          href={item.url}
          download={item.name}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          {item.name}
        </a>
      )}
      <p className="mt-2 text-xs text-slate-500">
        {item.name} - {prettySize}
      </p>
    </div>
  );
}
