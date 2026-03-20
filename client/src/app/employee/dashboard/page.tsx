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
    <div className="flex h-full min-h-0 flex-col gap-6 pb-10">
      <div className="w-full">
        <h2 className="text-lg font-bold text-black tracking-wide font-serif">
          Employee Dashboard
        </h2>
        <p className="text-sm font-semibold font-serif text-gray-500 tracking-wide">
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
          cardClassName="shadow-lg border-none"
          titleClassName="text-[14px] font-bold uppercase text-gray-900"
          valueClassName="mt-2 text-3xl font-bold text-slate-900"
          descClassName="mt-2 text-[14px] text-gray-600"
        />
        <SummaryCard
          title="Finished"
          value={stats?.completedTasks ?? 0}
          desc="Completed tasks"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
          cardClassName="shadow-lg border-none"
          titleClassName="text-[14px] font-bold uppercase text-gray-900"
          valueClassName="mt-2 text-3xl font-bold text-slate-900"
          descClassName="mt-2 text-[14px] text-gray-600"
        />
      </div>

      <section className="flex flex-1 min-h-0 flex-col gap-4">
        <div className="flex items-center justify-between bg-gray-200 p-3">
          <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider">
            My Task Feed
          </h3>
          <div className="relative flex justify-between items-center gap-2 outline-none focus:ring-1 pr-3 focus:ring-blue-500 border border-black rounded-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-80 rounded-md  px-3 py-1.5 text-[12px] text-slate-700 pr-8 outline-none focus:ring-none focus:border-none"
            />
            <FiSearch className="text-[16px] text-black" />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <p className="text-sm font-semibold text-gray-600">Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm font-semibold text-gray-600 italic">
              No tasks assigned yet.
            </p>
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
}: any) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border bg-white p-5 ${cardClassName || ""}`}
    >
      <div>
        <p className={titleClassName}>{title}</p>
        <p className={valueClassName}>{value}</p>
        <p className={descClassName}>{desc}</p>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}
