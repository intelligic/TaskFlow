"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, PlayCircle, CheckCircle2, Users } from "lucide-react";
import { employees } from "@/lib/mock-employees";

const summary = {
  totalTasks: 1284,
  totalChange: "+12% from last week",
  activeTasks: 142,
  activeDesc: "Currently in progress",
  completedTasks: 1142,
  completedDesc: "89% Success rate",
  activeUsers: employees.length,
  usersDesc: `Across ${employees.length} team members`,
};

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-black tracking-wide font-serif">
          Admin Dashboard
        </h2>
        <p className="text-md font-semibold font-serif text-gray-500 text-semibold tracking-wide">
          Real-time task overview and employee performance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total Tasks"
          value={summary.totalTasks}
          desc={summary.totalChange}
          icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
          cardClassName="shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase tracking-wide text-gray-900"
          valueClassName="mt-3 text-3xl font-bold text-slate-900 leading-none "
          descClassName="mt-3 font-medium text-green-600 text-sm"
        />
        <SummaryCard
          title="Active Tasks"
          value={summary.activeTasks}
          desc={summary.activeDesc}
          icon={<PlayCircle className="h-5 w-5 text-orange-600" />}
          iconBg="bg-orange-100"
          cardClassName="shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase tracking-wide text-gray-900"
          valueClassName="mt-3 text-3xl font-bold text-slate-900 leading-none "
          descClassName="mt-3 font-medium text-green-600 text-sm"
        />
        <SummaryCard
          title="Completed"
          value={summary.completedTasks}
          desc={summary.completedDesc}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
          cardClassName="shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase tracking-wide text-gray-900"
          valueClassName="mt-3 text-3xl font-bold text-slate-900 leading-none "
          descClassName="mt-3 font-medium text-green-600 text-sm"
        />
        <SummaryCard
          title="Active Users"
          value={summary.activeUsers}
          desc={summary.usersDesc}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
          cardClassName="shadow-lg hover:shadow-xl transition-shadow duration-300"
          titleClassName="text-[14px] font-bold uppercase tracking-wide text-gray-900"
          valueClassName="mt-3 text-3xl font-bold text-slate-900 leading-none "
          descClassName="mt-3 font-medium text-green-600 text-sm"
        />
      </div>

      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-3 border-b px-4 py-3 text-sm text-gray-500">
          <span>Employee</span>
          <span>Tasks (Pending / Completed)</span>
          <span className="text-right">Last Activity</span>
        </div>

        {employees.map((emp) => (
          <div
            key={emp.id}
            className="grid cursor-pointer grid-cols-3 border-b px-4 py-3 last:border-b-0 hover:bg-gray-50"
            onClick={() => router.push(`/admin/chat/${emp.id}`)}
          >
            <div>
              <p className="font-medium">{emp.name}</p>
              <p className="text-xs text-gray-500">{emp.role}</p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span>Pending: {emp.pending}</span>
              <span>Completed: {emp.completed}</span>
            </div>

            <div className="text-right text-sm text-gray-500">
              {emp.lastActive}
            </div>
          </div>
        ))}
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
    <div
      className={`flex items-center justify-between rounded-lg border bg-white p-4 ${cardClassName || ""}`}
    >
      <div>
        <p className={titleClassName || "text-xs text-gray-500"}>{title}</p>
        <p className={valueClassName || "text-xl font-semibold"}>{value}</p>
        <p className={descClassName || "mt-1 text-xs text-green-600"}>{desc}</p>
      </div>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}
