'use client';

import { CheckCircle2, ClipboardList } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getTagClasses } from '@/lib/task-tags';
import {
  createTaskComment,
  getAssignedTasks,
  getTaskComments,
  updateTaskStatus,
  uploadTaskAttachment,
  type Task,
  type TaskAttachment,
  type TaskComment,
  type TaskStatus,
} from '@/lib/api/taskApi';
import { getProfile } from '@/lib/api/authApi';

type TaskItem = {
  id: string;
  title: string;
  desc: string;
  status: TaskStatus;
  projectName?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  attachments?: TaskAttachment[];
};

const normalizeStatus = (value?: string): TaskStatus => {
  if (!value) return 'TODO';
  const upper = value.trim().toUpperCase();
  const lower = value.trim().toLowerCase();
  if (lower === 'pending') return 'TODO';
  if (lower === 'completed' || lower === 'closed') return 'COMPLETED';
  if (upper === 'TODO') return 'TODO';
  if (upper === 'IN-PROGRESS' || upper === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (upper === 'REVIEW') return 'REVIEW';
  if (upper === 'DONE' || upper === 'COMPLETED') return 'COMPLETED';
  if (value === 'todo') return 'TODO';
  if (value === 'in-progress') return 'IN_PROGRESS';
  if (value === 'done') return 'COMPLETED';
  return 'TODO';
};

export default function EmployeeDashboardPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeProfile, setEmployeeProfile] = useState({
    name: 'Employee',
    designation: 'Team Member',
  });
  const [loading, setLoading] = useState(true);

  const loadAssigned = async () => {
    try {
      setLoading(true);
      const res = await getAssignedTasks();
      const list = Array.isArray(res) ? res : (res as { tasks: Task[] }).tasks;
      const mapped: TaskItem[] = (list || []).map((t) => {
        const project = typeof t.projectId === 'string' ? undefined : t.projectId;
        return {
          id: t._id,
          title: t.title,
          desc: t.description || '',
          status: normalizeStatus(t.status),
          projectName: project?.name,
          priority: t.priority,
          dueDate: t.dueDate,
          attachments: Array.isArray(t.attachments) ? t.attachments : [],
        };
      });
      setTasks(mapped);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssigned();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;
        setEmployeeProfile({
          name: profile?.name || 'Employee',
          designation: profile?.designation || 'Team Member',
        });
      } catch {
        if (cancelled) return;
        setEmployeeProfile({ name: 'Employee', designation: 'Team Member' });
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalAssigned = tasks.length;
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === 'COMPLETED').length,
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.desc.toLowerCase().includes(query),
    );
  }, [searchTerm, tasks]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      {/* Maine Heading */}
      <div className='w-full'>
        <h2 className="text-lg font-bold text-black tracking-wide font-serif">Employee Dashboard</h2>
        <p className="text-sm font-semibold font-serif text-gray-500 text-semibold tracking-wide">
          {employeeProfile.name} | {employeeProfile.designation}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <SummaryCard
          title="Total Assigned Tasks"
          value={totalAssigned}
          desc="All tasks assigned to you"
          icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          cardClassName="shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase tracking-wide text-gray-900"
          valueClassName="mt-2 text-3xl font-bold text-slate-900 leading-none "
          descClassName="mt-2 text-[14px] font-medium text-black"
        />
        <SummaryCard
          title="Completed Tasks"
          value={completedTasks}
          desc="Tasks marked complete"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
          cardClassName=" shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase text-gray-900"
          valueClassName="mt-2 text-3xl font-bold text-slate-900 tracking-wide leading-none "
          descClassName="mt-2 font-medium text-black text-[14px]"
        />
      </div>

      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg p-1">
        <div className="flex items-center justify-between rounded-t-lg border border-gray-200 bg-gray-200 px-4 py-3">
          <h3 className="text-[15px] font-bold text-slate-800">Task Feed</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border border-t-0 border-gray-200 rounded-b-lg p-3 bg-white">
          {loading ? (
            <p className="text-sm font-semibold text-gray-600">Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm font-semibold text-gray-600">No tasks assigned yet.</p>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} refreshTasks={loadAssigned} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  desc,
  icon,
  iconBg,
  cardClassName,
  titleClassName,
  valueClassName,
  descClassName,
}: {
  title: string;
  value: number;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  cardClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
  descClassName?: string;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border bg-white p-4 ${cardClassName || ''}`}>
      <div>
        <p className={titleClassName || 'text-xs text-gray-500'}>{title}</p>
        <p className={valueClassName || 'text-xl font-semibold'}>{value}</p>
        <p className={descClassName || 'mt-1 text-xs text-gray-500'}>{desc}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
    </div>
  );
}

function TaskCard({
  task,
  refreshTasks,
}: {
  task: TaskItem;
  refreshTasks: () => Promise<void>;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN || '';

  useEffect(() => {
    if (!showComments) return;

    let cancelled = false;

    const load = async () => {
      try {
        setCommentsError('');
        setCommentsLoading(true);
        const res = await getTaskComments(task.id);
        if (cancelled) return;
        setComments(Array.isArray(res) ? res : []);
      } catch {
        if (cancelled) return;
        setComments([]);
        setCommentsError('Failed to load comments');
      } finally {
        if (cancelled) return;
        setCommentsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [showComments, task.id]);

  return (
    <div className="space-y-1 rounded-lg border bg-white p-3" >
      <h3 className="font-bold text-[14px] text-black">{task.title}</h3>
      <p className="text-[12px] font-medium text-gray-800">{task.desc}</p>
      <p className="text-[12px] font-semibold text-gray-500">
        Project: {task.projectName || '-'} - Priority: {task.priority || '-'} - Due:{' '}
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {task.status === 'TODO' && (
          <button
            disabled={updating}
            onClick={async () => {
              try {
                setStatusError('');
                setUpdating(true);
                await updateTaskStatus(task.id, 'IN_PROGRESS');
                await refreshTasks();
              } catch {
                setStatusError('Failed to update status');
              } finally {
                setUpdating(false);
              }
            }}
            className="rounded bg-blue-600 px-3 py-1 text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Start Task
          </button>
        )}

        {task.status === 'IN_PROGRESS' && (
          <button
            disabled={updating}
            onClick={async () => {
              try {
                setStatusError('');
                setUpdating(true);
                await updateTaskStatus(task.id, 'REVIEW');
                await refreshTasks();
              } catch {
                setStatusError('Failed to update status');
              } finally {
                setUpdating(false);
              }
            }}
            className="rounded bg-orange-600 px-3 py-1 text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send To Review
          </button>
        )}

        <span className="text-[12px] font-bold text-gray-600">
          Status: {task.status.replace('_', ' ')}
        </span>
      </div>

      {!!statusError && (
        <p className="text-[12px] font-semibold text-red-600">{statusError}</p>
      )}

      <div className="mt-2 space-y-2 rounded border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full text-[12px] font-semibold text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
          />
          <button
            type="button"
            disabled={!selectedFile || uploading}
            onClick={async () => {
              if (!selectedFile) return;
              try {
                setUploadError('');
                setUploading(true);
                await uploadTaskAttachment(task.id, selectedFile);
                setSelectedFile(null);
                await refreshTasks();
              } catch {
                setUploadError('Failed to upload file');
              } finally {
                setUploading(false);
              }
            }}
            className="rounded bg-blue-600 px-3 py-1 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {!!uploadError && (
          <p className="text-[12px] font-semibold text-red-600">{uploadError}</p>
        )}

        {task.attachments && task.attachments.length > 0 && (
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-slate-700">Attachments</p>
            <ul className="space-y-1">
              {task.attachments.map((att, index) => {
                const href = att.fileUrl
                  ? att.fileUrl.startsWith('http')
                    ? att.fileUrl
                    : `${backendOrigin}${att.fileUrl}`
                  : '';

                return (
                  <li key={`${task.id}-att-${index}`} className="text-[12px] font-semibold">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {att.fileName || 'Download file'}
                      </a>
                    ) : (
                      <span className="text-gray-600">{att.fileName || 'File'}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowComments((prev) => !prev)}
        className="text-[12px] text-blue-600 hover:underline duration-700 font-bold"
      >
        {showComments ? 'Hide Comments' : 'Open Comments'}
      </button>

      {!!task.tags?.length && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {task.tags.map((tag) => (
            <span
              key={`${task.id}-${tag}`}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getTagClasses(tag, 'badge')}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {showComments && (
        <div className=" space-y-2 border-t">
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {commentsLoading && (
              <p className="text-[12px] font-semibold text-gray-400">Loading comments...</p>
            )}

            {!!commentsError && (
              <p className="text-[12px] font-semibold text-red-600">{commentsError}</p>
            )}

            {!commentsLoading && !commentsError && comments.length === 0 && (
              <p className="text-[12px] font-semibold text-gray-400">No comments yet.</p>
            )}

            {comments.map((item, index) => (
              <div key={item._id || `${task.id}-${index}`} className="rounded bg-gray-100 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-bold text-gray-800">
                    {item.author?.name || "Unknown"}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                <p className="mt-1 text-[12px] font-semibold text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write comment..."
              className="flex-1 rounded border px-2 py-1 text-[12px] font-medium text-gray-700 focus:outline-none focus:border-none  focus:ring-1 focus:ring-blue-600"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              disabled={postingComment}
              onClick={async () => {
                const message = comment.trim();
                if (!message) return;

                try {
                  setCommentsError("");
                  setPostingComment(true);
                  await createTaskComment(task.id, message);
                  setComment("");
                  const res = await getTaskComments(task.id);
                  setComments(Array.isArray(res) ? res : []);
                } catch {
                  setCommentsError("Failed to post comment");
                } finally {
                  setPostingComment(false);
                }
              }}
              className="rounded bg-blue-600 px-3 py-1 text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {postingComment ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

