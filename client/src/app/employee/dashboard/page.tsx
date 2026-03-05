'use client';

import { CheckCircle2, ClipboardList } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { employees } from '@/lib/mock-employees';

type TaskStatus = 'pending' | 'completed' | 'closed';

type TaskItem = {
  id: string;
  title: string;
  desc: string;
  status: TaskStatus;
};

const TASKS_PER_PAGE = 4;

const initialTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Update Security Protocols',
    desc: 'Review and update firewall rules.',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Q2 Performance Audit',
    desc: 'Audit weekly performance logs.',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Initial Workspace Setup',
    desc: 'Configure dev environment.',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Client Follow-up',
    desc: 'Share revised timeline and dependencies.',
    status: 'completed',
  },
  {
    id: '5',
    title: 'Fix API Retry Logic',
    desc: 'Handle timeout retries for task sync endpoint.',
    status: 'pending',
  },
  {
    id: '6',
    title: 'Prepare Weekly Report',
    desc: 'Compile completed and pending items for admin review.',
    status: 'closed',
  },
  {
    id: '7',
    title: 'Dashboard QA Pass',
    desc: 'Verify employee dashboard flows on mobile and desktop.',
    status: 'pending',
  },
  {
    id: '8',
    title: 'Archive Old Attachments',
    desc: 'Move outdated files to archive storage bucket.',
    status: 'completed',
  },
];

export default function EmployeeDashboardPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeProfile, setEmployeeProfile] = useState({
    name: 'Employee',
    designation: 'Team Member',
  });

  useEffect(() => {
    const storedName = localStorage.getItem('employeeName');
    const storedDesignation = localStorage.getItem('employeeDesignation');
    const storedEmail = localStorage.getItem('email') || localStorage.getItem('userEmail');

    if (storedName || storedDesignation) {
      setEmployeeProfile({
        name: storedName || 'Employee',
        designation: storedDesignation || 'Team Member',
      });
      return;
    }

    const matchedEmployee =
      employees.find((emp) => storedEmail && emp.email.toLowerCase() === storedEmail.toLowerCase()) ||
      employees[0];

    if (matchedEmployee) {
      setEmployeeProfile({
        name: matchedEmployee.name,
        designation: matchedEmployee.role,
      });
    }
  }, []);

  const totalAssigned = tasks.length;
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === 'completed').length,
    [tasks],
  );

  const totalPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * TASKS_PER_PAGE;
    return tasks.slice(start, start + TASKS_PER_PAGE);
  }, [currentPage, tasks]);

  const startItem = tasks.length === 0 ? 0 : (currentPage - 1) * TASKS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * TASKS_PER_PAGE, tasks.length);

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-8 overflow-hidden items-center justify-center">
      {/* Maine Heading */}
      <div className='w-full'>
        <h2 className="text-xl font-bold text-black tracking-wide font-serif">Employee Dashboard</h2>
        <p className="text-md font-semibold font-serif text-gray-500 text-semibold tracking-wide">
          {employeeProfile.name} | {employeeProfile.designation}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 w-300 items-center justify-center ">
        <SummaryCard
          title="Total Assigned Tasks"
          value={totalAssigned}
          desc="All tasks assigned to you"
          icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          cardClassName="shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase tracking-wide text-gray-900"
          valueClassName="mt-2 text-3xl font-bold text-slate-900 leading-none "
          descClassName="mt-2 text-md font-medium text-black"
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
          descClassName="mt-2 font-medium text-black text-sm"
        />
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg w-full">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {paginatedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={updateTaskStatus} />
          ))}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 font-serif bg-white px-4 py-2 text-sm md:flex-row md:items-center md:justify-between mt-2">
          <p className="text-black text-[14px] font-bold">
            Showing {startItem}-{endItem} of {tasks.length} tasks
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded border border-black px-6 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-80"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              const active = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded border px-3 py-1.5 text-gray-500 ${
                    active ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
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
  onStatusChange,
}: {
  task: TaskItem;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [...prev, comment.trim()]);
    setComment('');
  };

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <h3 className="font-bold text-md text-black">{task.title}</h3>
      <p className="text-sm text-gray-800">{task.desc}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <StatusButton
          active={task.status === 'pending'}
          color="red"
          onClick={() => onStatusChange(task.id, 'pending')}
        >
          Pending
        </StatusButton>

        <StatusButton
          active={task.status === 'completed'}
          color="blue"
          onClick={() => onStatusChange(task.id, 'completed')}
        >
          Complete
        </StatusButton>

        <StatusButton
          active={task.status === 'closed'}
          color="green"
          onClick={() => onStatusChange(task.id, 'closed')}
        >
          Close
        </StatusButton>
      </div>

      <button
        onClick={() => setShowComments((prev) => !prev)}
        className="text-[14px] text-blue-600 hover:underline duration-700 font-bold"
      >
        {showComments ? 'Hide Comments' : 'Open Comments'}
      </button>

      {showComments && (
        <div className=" space-y-2 border-t pt-2">
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {comments.length === 0 && <p className="text-[12px] font-semibold text-gray-400">No comments yet.</p>}

            {comments.map((item, index) => (
              <div key={`${task.id}-${index}`} className="rounded bg-gray-100 px-3 py-2 text-xs">
                {item}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write your doubt..."
              className="flex-1 rounded border px-2 py-1 text-[14px] font-medium text-gray-700 focus:outline-none focus:border-none  focus:ring-1 focus:ring-blue-600"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button onClick={addComment} className="rounded bg-blue-600 px-3 py-1 text-[14px] text-white">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusButton({
  children,
  active,
  color,
  onClick,
}: {
  children: string;
  active: boolean;
  color: 'red' | 'blue' | 'green';
  onClick: () => void;
}) {
  const colors = {
    red: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-400 hover:bg-red-200',
    blue: active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-400 hover:bg-blue-200',
    green: active ? 'bg-green-600 text-white' : 'bg-green-100 text-green-400 hover:bg-green-200',
  };

  return (
    <button onClick={onClick} className={`rounded px-3 py-1 text-[14px] ${colors[color]}`}>
      {children}
    </button>
  );
}
