"use client";

import { useRouter } from "next/navigation";
// import { PiCloudArrowUpBold, PiCloudArrowDownBold } from "react-icons/pi";
import { RiArrowDownBoxFill, RiArrowUpBoxFill } from "react-icons/ri";

type EmployeeListProps = {
  data: Array<{
    _id: string;
    name: string;
    email: string;
    role?: string;
    designation?: string;
    slug?: string;
    status?: string;
    pending?: number;
    completed?: number;
  }>;
};

export default function EmployeeList({ data }: EmployeeListProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      {data.map((emp) => (
        <div
          key={emp._id}
          onClick={() => router.push(`/admin/chat/${emp.slug || emp._id}`)}
          className="flex flex-col sm:flex-row cursor-pointer items-start sm:items-center justify-between rounded border bg-white p-3 hover:bg-gray-50 gap-3"
        >
          <div className="flex flex-1 items-center justify-between w-full">
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-bold font-sans text-black truncate">{emp.name}</p>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 truncate">
                {emp.email} <span className="hidden sm:inline">|</span> <br className="sm:hidden" /> {emp.designation || "Employee"}
              </p>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 px-2">
              <div className="flex items-center gap-1">
                <RiArrowDownBoxFill size={18} className="text-red-500 sm:size-20" />
                <span className="text-xs font-bold text-slate-700">{emp.pending ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <RiArrowUpBoxFill size={18} className="text-green-500 sm:size-20" />
                <span className="text-xs font-bold text-slate-700">{emp.completed ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-50">
            <span
              className={`rounded px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                emp.status === "Active"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {emp.status || "Active"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
