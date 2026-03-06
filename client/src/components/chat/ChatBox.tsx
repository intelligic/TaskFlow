'use client';

import { useEffect, useState } from 'react';
import TaskBubble from './TaskBubble';
import ChatInput from './ChatInput';

type TaskStatus = 'pending' | 'completed' | 'closed';

type TaskMessage = {
  id: string;
  type: 'task';
  text: string;
  status: TaskStatus;
};

type AttachmentMessage = {
  id: string;
  type: 'attachment';
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

type ChatMessage = TaskMessage | AttachmentMessage;

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'task',
    text: "Please complete today's report.",
    status: 'pending',
  },
  {
    id: '2',
    type: 'task',
    text: "Please complete today's report.",
    status: 'pending',
  },
  {
    id: '3',
    type: 'task',
    text: "Please complete today's report.",
    status: 'pending',
  },
];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

export default function ChatBox({
  role = 'admin',
  conversationKey = 'employee-1',
  persistMessages = false,
}: {
  role?: 'admin' | 'employee';
  conversationKey?: string;
  persistMessages?: boolean;
}) {
  const storageKey = `chat-conversation:${conversationKey}`;
  const readConversation = (key: string): ChatMessage[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return DEFAULT_MESSAGES;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MESSAGES;
      const looksLikeOldSingleSeed =
        parsed.length === 1 &&
        parsed[0]?.type === 'task' &&
        parsed[0]?.text === "Please complete today's report.";
      if (looksLikeOldSingleSeed) return DEFAULT_MESSAGES;
      return parsed;
    } catch {
      localStorage.removeItem(key);
      return DEFAULT_MESSAGES;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);

  useEffect(() => {
    if (!persistMessages) {
      setMessages(DEFAULT_MESSAGES);
      return;
    }
    setMessages(readConversation(storageKey));
  }, [persistMessages, storageKey]);

  useEffect(() => {
    if (!persistMessages) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore storage quota/serialization issues in UI layer.
    }
  }, [messages, persistMessages, storageKey]);

  const handleSendTask = async (msg: string, files: File[] = []) => {
    const nextMessages: ChatMessage[] = [];
    const ts = Date.now();

    if (msg.trim()) {
      nextMessages.push({
        id: `${ts}-msg`,
        type: 'task',
        text: msg.trim(),
        status: 'pending',
      });
    }

    if (files.length > 0) {
      const attachmentPayloads = await Promise.all(
        files.map(async (file, index) => ({
          id: `${ts}-file-${index}`,
          type: 'attachment' as const,
          name: file.name,
          url: await fileToDataUrl(file),
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
        })),
      );

      nextMessages.push(...attachmentPayloads);
    }

    if (nextMessages.length === 0) return;
    setMessages((prev) => [...prev, ...nextMessages]);
  };

  const updateStatus = (id: string, status: TaskStatus) => {
    setMessages((prev) =>
      prev.map((item) =>
        item.type === 'task' && item.id === id ? { ...item, status } : item,
      ),
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-white">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {messages.map((item) =>
          item.type === 'task' ? (
            <TaskBubble key={item.id} task={item} role={role} onUpdateStatus={updateStatus} />
          ) : (
            <AttachmentBubble key={item.id} item={item} />
          ),
        )}
      </div>

      {role === 'admin' && (
        <div className="shrink-0 border-t bg-white">
          <ChatInput onSend={handleSendTask} />
        </div>
      )}

      {role === 'employee' && (
        <div className="shrink-0 border-t bg-white p-3 text-center text-sm text-gray-500">
          You can update task status using buttons above.
        </div>
      )}
    </div>
  );
}

function AttachmentBubble({ item }: { item: AttachmentMessage }) {
  const isImage = item.mimeType.startsWith('image/');
  const prettySize =
    item.size < 1024 * 1024
      ? `${Math.max(1, Math.round(item.size / 1024))} KB`
      : `${(item.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="max-w-xl rounded-lg border bg-slate-50 p-3">
      {isImage ? (
        <a href={item.url} target="_blank" rel="noreferrer" className="block">
          <img src={item.url} alt={item.name} className="max-h-64 w-auto rounded-md object-contain" />
        </a>
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
        {item.name} • {prettySize}
      </p>
    </div>
  );
}
