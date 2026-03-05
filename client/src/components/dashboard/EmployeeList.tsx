"use client";

import { useRouter } from "next/navigation";
import { employees } from "@/lib/mock-employees";
import { PiCloudArrowUpBold, PiCloudArrowDownBold } from "react-icons/pi";
import { HiArrowDownOnSquare } from "react-icons/hi2";

export default function EmployeeList() {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {employees.map((emp) => (
        <div
          key={emp.id}
          onClick={() => router.push(`/admin/chat/${emp.id}`)}
          className="flex cursor-pointer items-center justify-between rounded border bg-white p-3 hover:bg-gray-50"
        >
          <div className="flex justify-end items-end gap-5">
            <div className="flex flex-col justify-center items-start gap-2">
              <p className="font-bold font-serif text-black">{emp.name}</p>
              <p className="text-sm font-medium text-gray-500">
                {emp.email} | {emp.role}
              </p>
            </div>
            <div className='flex justify-center items-start gap-2'>
              <span className="text-black text-[16px] py-1 px-2 rounded-md flex items-center gap-1">
                <PiCloudArrowDownBold size={22} className='text-red-500' />
                <sup>{emp.pending}</sup>
              </span>
              <span className="text-black text-[16px] py-1 px-2 rounded-md flex items-center gap-1">
                <PiCloudArrowUpBold size={22} className='text-red-500' />
                <sup>{emp.completed}</sup>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {/* <span className="text-white bg-red-500 py-1 px-2 rounded-md flex items-center gap-2">
              <PiMonitorArrowUpFill size={22} />
              {emp.pending}
            </span>
            <span className="text-white bg-blue-500 py-1 px-3 rounded-md">
              Completed: {emp.completed}
            </span> */}
            <span
              className={`rounded px-3 py-1 text-xs ${
                emp.status === "Active"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {emp.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
