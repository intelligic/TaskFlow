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
          className="flex cursor-pointer items-center justify-between rounded border bg-white p-2 hover:bg-gray-50"
        >
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold font-sans text-black">{emp.name}</p>
              <p className="text-xs font-medium text-gray-500">
                {emp.email} | {emp.designation || "Employee"}
              </p>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <RiArrowDownBoxFill size={20} className="text-red-500" />
                <span className="text-xs font-bold text-slate-700">{emp.pending ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <RiArrowUpBoxFill size={20} className="text-green-500" />
                <span className="text-xs font-bold text-slate-700">{emp.completed ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm ml-3">
            <span
              className={`rounded px-3 py-1 text-xs ${
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
