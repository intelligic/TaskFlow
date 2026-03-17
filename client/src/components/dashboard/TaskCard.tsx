'use client';

import { useEffect, useState } from 'react';
import { Task, TaskComment, TaskStatus } from '@/types/task';
import { updateTaskStatus, getTaskComments, createTaskComment } from '@/lib/api/taskApi';
import { MessageSquare, Send, Pencil, Tag } from 'lucide-react';
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

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    try {
      setIsUpdating(true);
      await updateTaskStatus(task._id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="rounded-lg border-gray-200 bg-white text-black p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[16px] font-bold text-slate-900">{task.title}</h4>
          <p className="mt-1 text-[14px] text-slate-500 line-clamp-2">{task.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className='font-semibold tracking-wider text-[12px] text-slate-600'>Assigned to: <span className="text-slate-900 font-bold tracking-wider text-[13px]">{assigneeName}</span></span>
            {task.dueDate && <span className="text-[12px] font-semibold tracking-wider text-slate-600">Due: <span className="text-slate-900 font-bold tracking-wider text-[13px]">{new Date(task.dueDate).toLocaleDateString()}</span></span>}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span key={tag} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${getTagClasses(tag, 'badge')}`}>
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider 
            ${task.status === 'pending' ? 'bg-orange-100 text-orange-600' : ''}
            ${task.status === 'completed' ? 'bg-blue-100 text-blue-600' : ''}
            ${task.status === 'closed' ? 'bg-green-100 text-green-600' : ''}
            ${task.status === 'archived' ? 'bg-slate-100 text-slate-600' : ''}
          `}>
            {task.status}
          </span>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
          >
            <MessageSquare size={14} />
            {commentCount} Comments
          </button>
          
          {role === 'admin' && (
            <button 
              onClick={() => router.push(`/admin/task/update?id=${task._id}`)}
              className="flex items-center gap-1 text-[14px] font-bold text-green-600 transition-colors"
            >
              <Pencil size={14} className='text-green-600' />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {/* Employee Actions */}
        {role === 'employee' && task.status === 'pending' && (
          <button
            disabled={isUpdating}
            onClick={() => handleStatusUpdate('completed')}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Mark Completed
          </button>
        )}
        {role === 'employee' && task.status === 'closed' && (
          <button
            disabled={isUpdating}
            onClick={() => handleStatusUpdate('archived')}
            className="rounded bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Archive Task
          </button>
        )}

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
    </div>
  );
}
