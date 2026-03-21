"use client";

import { CheckCircle2, ClipboardList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getTasks } from "@/lib/api/taskApi";
import { getDashboardStats, type DashboardStats } from "@/lib/api/dashboardApi";
import { Task } from "@/types/task";
import { getProfile } from "@/lib/api/authApi";
import TaskCard from "@/components/dashboard/TaskCard";
import { socket } from "@/lib/socket";
import { FiSearch } from "react-icons/fi";

export default function EmployeeDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeProfile, setEmployeeProfile] = useState({
    name: "Employee",
    designation: "Team Member",
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        getTasks(),
        getDashboardStats(),
      ]);
      setTasks(tasksRes.tasks || []);
      setStats(statsRes);
    } catch {
      setTasks([]);
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

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;
        setEmployeeProfile({
          name: profile?.name || "Employee",
          designation: profile?.designation || "Team Member",
        });
      } catch {
        if (cancelled) return;
        setEmployeeProfile({ name: "Employee", designation: "Team Member" });
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalAssigned = tasks.length;
  const completedCount = useMemo(
    () =>
      tasks.filter((t) => t.status === "completed" || t.status === "closed")
        .length,
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query),
    );
  }, [searchTerm, tasks]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 pb-4">
      <div className="w-full">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-wide font-heading">
          Employee Dashboard
        </h2>
        <p className="text-sm font-semibold font-sans text-slate-500 tracking-wide">
          {employeeProfile.name} | {employeeProfile.designation}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <SummaryCard
          title="My Tasks"
          value={stats?.totalTasks ?? 0}
          desc="Tasks assigned to you"
          icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          cardClassName="shadow-[0_8px_20px_rgba(15,23,42,0.08)] border border-slate-100"
          titleClassName="text-[13px] font-bold uppercase text-slate-600 tracking-wider"
          valueClassName="mt-2 text-4xl font-bold text-slate-900"
          descClassName="mt-2 text-[14px] text-slate-500"
          showAvatar
          avatarText={employeeProfile.name}
        />
        <SummaryCard
          title="Finished"
          value={stats?.completedTasks ?? 0}
          desc="Completed tasks"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
          cardClassName="shadow-[0_8px_20px_rgba(15,23,42,0.08)] border border-slate-100"
          titleClassName="text-[13px] font-bold uppercase text-slate-600 tracking-wider"
          valueClassName="mt-2 text-4xl font-bold text-slate-900"
          descClassName="mt-2 text-[14px] text-slate-500"
        />
      </div>

      <section className="flex flex-1 min-h-0 flex-col gap-4 rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-100">
        <div className="flex items-center justify-between rounded-t-2xl bg-slate-400/70 px-5 py-2">
          <h3 className="text-[16px] font-extrabold text-slate-800 uppercase tracking-wide">
            My Task Feed
          </h3>
          <div className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm">
            <FiSearch className="text-[16px] text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-56 md:w-72 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-5 pb-5">
          {loading ? (
            <p className="text-sm font-semibold text-slate-600">Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-between gap-8 md:grid-cols-2">
                <div className="w-130 mx-auto">
                    <img src='/NoTaskImg.webp' className="h-80 w-full object-cover" alt="NO Task Image"/>
                </div>
                
                <div className="text-center md:text-left flex items-center justify-center flex-col gap-5">
                  <h4 className="text-3xl font-extrabold text-slate-800">
                    No tasks assigned yet
                  </h4>
                  <p className="text-[16px] text-slate-500 text-center">
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
            filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                role="employee"
                onRefresh={loadData}
              />
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
  showAvatar,
  avatarText,
}: any) {
  const initials = String(avatarText || "Employee")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-white p-6 ${cardClassName || ""}`}
    >
      <div className="flex items-center gap-4">
        {showAvatar && (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 shadow-inner">
            {initials || "E"}
          </div>
        )}
        <div>
        <p className={titleClassName}>{title}</p>
        <p className={valueClassName}>{value}</p>
        <p className={descClassName}>{desc}</p>
        </div>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}
