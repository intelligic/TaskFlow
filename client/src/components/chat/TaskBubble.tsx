'use client';

import Image from 'next/image';
import { Calendar, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getTagClasses } from '@/lib/task-tags';

type TaskStatus = 'pending' | 'completed' | 'closed';

export default function TaskBubble({
  task,
  role,
  onUpdateStatus,
}: {
  task: {
    id: string;
    text: string;
    status: TaskStatus;
    description?: string;
    dueDate?: string;
    tags?: string[];
    attachments?: {
      name: string;
      url: string;
      mimeType?: string;
      size?: number;
    }[];
  };
  role: 'admin' | 'employee';
  onUpdateStatus: (id: string, status: TaskStatus) => void;
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isPending = task.status === 'pending';
  const isCompleted = task.status === 'completed';
  const isClosed = task.status === 'closed';
  const hasLongDescription = useMemo(() => {
    const text = task.description || '';
    return text.trim().length > 140;
  }, [task.description]);

  const resolveAssetUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
    const origin = base.replace(/\/api\/?$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  return (
    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
      <p className="whitespace-pre-wrap wrap-break-word text-sm font-bold text-black">{task.text}</p>
      {task.description && task.description.trim() !== "" && (
        <div>
          <p className={`text-[13px] text-slate-500 ${isDescriptionExpanded ? "" : "line-clamp-2"}`}>
            {task.description}
          </p>
          {hasLongDescription && (
            <button
              type="button"
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-600"
            >
              {isDescriptionExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {task.attachments && task.attachments.length > 0 && (
        <div className="space-y-2">
          {task.attachments.map((item) => {
            const isImage = (item.mimeType || '').startsWith('image/');
            const isAudio = (item.mimeType || '').startsWith('audio/');
            const prettySize =
              (item.size || 0) < 1024 * 1024
                ? `${Math.max(1, Math.round((item.size || 0) / 1024))} KB`
                : `${((item.size || 0) / (1024 * 1024)).toFixed(1)} MB`;

            const assetUrl = resolveAssetUrl(item.url);
            return (
              <div key={item.url} className="max-w-xl rounded-lg border bg-white p-3">
                {isImage ? (
                  <a href={assetUrl} target="_blank" rel="noreferrer" className="block">
                    <div className="relative h-64 w-full max-w-xl overflow-hidden rounded-md bg-white">
                      <Image
                        src={assetUrl}
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
                    <source src={assetUrl} type={item.mimeType || 'audio/webm'} />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <a
                    href={assetUrl}
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
          })}
        </div>
      )}

      {(task.dueDate || (task.tags && task.tags.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.tags && task.tags.length > 0 && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${getTagClasses(task.tags[0], 'badge')}`}>
              <Tag size={12} />
              {task.tags[0]}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-5 text-[12px]">
        {/* Pending */}
        <button
          onClick={() => role === 'admin' && onUpdateStatus(task.id, 'pending')}
          disabled={!(role === 'admin' && !isPending)}
          className={`rounded px-5 py-1 text-[14px] ${
            isPending
              ? 'bg-red-600 text-white'
              : role === 'admin'
              ? 'bg-red-100 text-red-400 hover:bg-red-200'
              : 'bg-red-100 text-red-400 cursor-not-allowed opacity-70'
          }`}
        >
          Pending
        </button>

        {/* Complete (Employee action) */}
        <button
          onClick={() => role === 'employee' && onUpdateStatus(task.id, 'completed')}
          disabled={!(role === 'employee' && isPending)}
          className={`rounded px-5 py-1 text-[14px] ${
            isCompleted
              ? 'bg-blue-600 text-white'
              : role === 'employee' && isPending
              ? 'bg-blue-100 text-blue-400 hover:bg-blue-200'
              : 'bg-blue-100 text-blue-400 cursor-not-allowed opacity-70'
          }`}
        >
          Complete
        </button>

        {/* Close (Admin action) */}
        <button
          onClick={() => role === 'admin' && onUpdateStatus(task.id, 'closed')}
          disabled={!(role === 'admin' && isCompleted)}
          className={`rounded px-5 py-1 text-[14px] ${
            isClosed
              ? 'bg-green-600 text-white'
              : role === 'admin' && isCompleted
              ? 'bg-green-100 text-green-400 hover:bg-green-200'
              : 'bg-green-100 text-green-400 cursor-not-allowed opacity-70'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
