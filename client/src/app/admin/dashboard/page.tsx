"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, PlayCircle, CheckCircle2, Users } from "lucide-react";
import { employees } from "@/lib/mock-employees";
import { RiArrowDownBoxFill, RiArrowUpBoxFill } from "react-icons/ri";

const ITEMS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredEmployees]);

  const startItem = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length);

  return (
    <div className="flex h-full min-h-0 flex-col gap-8 overflow-hidden">
      <div>
        <h2 className="text-lg font-bold text-black tracking-wide font-serif">
          Admin Dashboard
        </h2>
        <p className="text-sm font-semibold font-serif text-gray-500 text-semibold tracking-wide">
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
          descClassName="mt-3 font-medium text-green-600 text-[12px]"
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
          descClassName="mt-3 font-medium text-green-600 text-[12px]"
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
          descClassName="mt-3 font-medium text-green-600 text-[12px]"
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
          descClassName="mt-3 font-medium text-green-600 text-[12px]"
        />
      </div>

      <section className="overflow-hidden rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b border-b-gray-100 px-4 py-3">
          <h3 className="text-[15px] font-bold text-slate-800">Employee Task Feed</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or designation..."
            className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex  justify-between items-center text-center border-b px-4 py-3 border-b-gray-100 text-[14px] opacity-80 bg-gray-200 text-black capatalize tracking-wide font-semibold">
          <span className="text-left">Employee</span>
          <span className="text-center">Tasks (Pending / Completed)</span>
          <span className="text-right">Last Activity</span>
        </div>

        <div>
          {paginatedEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex justify-betweenitems-center text-center cursor-pointer border-b border-b-gray-200 px-4 py-2 last:border-b-0 hover:bg-gray-50 text-[12px] font-semibold text-black  "
              onClick={() => router.push(`/admin/chat/${emp.id}`)}
            >
              <div className='flex flex-col items-start justify-center w-full'>
                <p className="text-[14px] font-bold font-serif text-black">{emp.name}</p>
                <p className="text-sm font-medium text-gray-500">{emp.role}</p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm w-full">
                <span className="text-black text-[16px] py-1 px-2 rounded-md flex items-center  justify-center gap-1 ">
                  <RiArrowDownBoxFill size={22}  className='text-red-500' /> 
                  <sup>{emp.pending}</sup>
                </span>
                <span className="text-black text-[16px] py-1 px-2 rounded-md flex items-center gap-1  ">
                  <RiArrowUpBoxFill size={22}  className='text-green-500' />
                  <sup>{emp.completed}</sup>
                 </span>
              </div>

              <div className="text-right text-sm text-gray-500 w-full">
                {emp.lastActive}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="shrink-0 flex flex-col gap-3 border rounded-lg bg-white px-4 py-2 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-black text-[14px] font-bold">
          Showing {startItem}-{endItem} of {filteredEmployees.length} employees
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
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
                className={`rounded border px-3 py-1.5 ${
                  active ? "border-blue-600 bg-blue-600 text-white" : "hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        </div>
      </div>
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
