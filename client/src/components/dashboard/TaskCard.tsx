'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Task, TaskComment, TaskStatus } from '@/types/task';
import { updateTaskStatus, getTaskComments, createTaskComment, deleteTask } from '@/lib/api/taskApi';
import { getApiErrorMessage } from '@/lib/api';
import { MessageSquare, Send, SquarePen, Tag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTagClasses } from '@/lib/task-tags';

type Props = {
  task: Task;
  role: 'admin' | 'employee';
  onRefresh?: () => void;
  commentsRefreshKey?: number;
};

export default function TaskCard({ task, role, onRefresh, commentsRefreshKey }: Props) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const res = await getTaskComments(task._id);
      setComments(res);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, task._id]);

  useEffect(() => {
    if (!showComments) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadComments();
      }
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadComments();
      }
    };

    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [showComments, task._id]);

  useEffect(() => {
    if (!showComments) return;
    if (typeof commentsRefreshKey === 'number') {
      loadComments();
    }
  }, [commentsRefreshKey, showComments, task._id]);

  const measureDescription = () => {
    if (!descriptionRef.current) return;
    const el = descriptionRef.current;
    const hadClamp = el.classList.contains('line-clamp-2');
    if (!hadClamp) {
      el.classList.add('line-clamp-2');
    }
    const isOverflowing = el.scrollHeight > el.clientHeight + 1;
    setCanExpandDescription(isOverflowing);
    if (!hadClamp && isDescriptionExpanded) {
      el.classList.remove('line-clamp-2');
    }
  };

  useLayoutEffect(() => {
    measureDescription();
  }, [task.description]);

  useEffect(() => {
    const handleResize = () => measureDescription();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    try {
      setIsUpdating(true);
      await updateTaskStatus(task._id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
      alert(getApiErrorMessage(err, 'Failed to update status'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsUpdating(true);
      await deleteTask(task._id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete task'));
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createTaskComment(task._id, commentText.trim());
      setCommentText('');
      await loadComments();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const assigneeName = typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Unknown';
  
  // Use the local comments state if it's been loaded, otherwise fall back to task.comments.length
  const backendCount = Array.isArray(task.comments) ? task.comments.length : 0;
  const commentCount = comments.length > 0 ? comments.length : backendCount;

  const resolveAssetUrl = (url?: string) => {
    if (!url) return url || '';
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

  const initials = String(assigneeName || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="rounded-2xl border border-slate-100 bg-white text-black p-5 shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 shadow-inner">
            {initials || 'U'}
          </div>
          <div className="flex-1">
            <h4 className="text-[17px] font-bold text-slate-900">{task.title}</h4>
          {task.description && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsDescriptionExpanded((current) => !current)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsDescriptionExpanded((current) => !current);
                }
              }}
              className="mt-1 cursor-pointer"
              title={isDescriptionExpanded ? 'Click to collapse' : 'Click to expand'}
            >
              <p
                ref={descriptionRef}
                className={`text-[14px] text-slate-500 ${
                  isDescriptionExpanded ? '' : 'line-clamp-2'
                }`}
              >
                {task.description}
              </p>
              {canExpandDescription && (
                <span className="mt-1 inline-block text-[10.5px] font-bold tracking-wide text-blue-600">
                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </span>
              )}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="font-semibold tracking-wider text-[12px] text-slate-600">
              Assigned to:{' '}
              <span className="text-slate-900 font-bold tracking-wider text-[14px]">{assigneeName}</span>
            </span>
            {task.dueDate && (
              <span className="text-[12px] font-semibold tracking-wider text-slate-600">
                Due:{' '}
                <span className="text-slate-900 font-bold tracking-wider text-[13px]">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 py-1 px-3 text-[12px] font-bold uppercase tracking-wide text-orange-800">
                Due date
              </span>
            )}
          </div>
          {/* Tags moved to action row for closer match to reference */}

          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {task.attachments.map((item) => {
                const isImage = (item.mimeType || '').startsWith('image/');
                const isAudio = (item.mimeType || '').startsWith('audio/');
                const prettySize =
                  (item.size || 0) < 1024 * 1024
                    ? `${Math.max(1, Math.round((item.size || 0) / 1024))} KB`
                    : `${((item.size || 0) / (1024 * 1024)).toFixed(1)} MB`;
                const assetUrl = resolveAssetUrl(item.url);

                return (
                  <div key={`${task._id}-${item.url}`} className="max-w-xl rounded-lg bg-slate-50 p-3">
                    {isImage ? (
                      <a href={assetUrl} target="_blank" rel="noreferrer" className="block">
                        <div className="relative h-48 w-full max-w-xl overflow-hidden rounded-md bg-white">
                          <img src={assetUrl} alt={item.name} className="h-full w-full object-contain" />
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
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-30">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider 
            ${task.status === 'pending' ? 'bg-orange-100 text-orange-600 py-1 px-3 text-[12px]' : ''}
            ${task.status === 'completed' ? 'bg-blue-100 text-blue-600 py-1 px-3 text-[12px]' : ''}
            ${task.status === 'closed' ? 'bg-green-100 text-green-600 py-1 px-3 text-[12px]' : ''}
            ${task.status === 'archived' ? 'bg-slate-100 text-slate-600 py-1 px-3 text-[12px]' : ''}
          `}>
            {task.status}
          </span>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-[12px] mt-2 font-bold text-blue-600 hover:underline"
          >
            <MessageSquare size={14} />
            {commentCount} Comments
          </button>
          
          {role === 'admin' && task.status !== 'archived' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/admin/task/update?id=${task._id}`)}
                className="rounded-full p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit task"
              >
                <SquarePen size={16} className="text-blue-600" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-full p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete task"
                disabled={isUpdating}
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 pl-18">
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${getTagClasses(
                    tag,
                    'badge',
                  )}`}
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Employee Actions */}
        <div className="flex items-center gap-2">
          {role === 'employee' && task.status === 'pending' && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate('completed')}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Mark Completed
            </button>
          )}
          {role === 'employee' && task.status === 'closed' && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate('archived')}
              className="rounded-full bg-slate-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-900 disabled:opacity-50"
            >
              Archive Task
            </button>
          )}
        </div>

        {/* Admin Actions */}
        {role === 'admin' && task.status === 'completed' && (
          <div className="flex gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate('closed')}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              Close
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleStatusUpdate('pending')}
              className="rounded bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              Pending
            </button>
          </div>
        )}

        {task.status === 'completed' && role === 'employee' && (
          <span className="text-[11px] font-bold italic text-blue-500">Awaiting Admin Review</span>
        )}
      </div>

      {showComments && (
        <div className="border-t pt-4 space-y-3">
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {loadingComments ? (
              <p className="text-xs text-slate-400">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="rounded bg-slate-50 p-2 text-xs border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700">{c.author?.name || 'User'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600">{c.message}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border bg-white p-5 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900">Delete Task</h4>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isUpdating}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
