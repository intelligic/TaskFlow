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
          <div className="flex justify-start gap-10  items-end w-130 relative">
            <div className="flex flex-col justify-center items-start gap-1 ">
              <p className=" text-[14px] font-bold font-serif text-black">{emp.name}</p>
              <p className="text-sm font-medium text-gray-500">
                {emp.email} | {emp.designation || "Employee"}
              </p>
            </div>
            {/* Icons */}
            <div className='flex justify-center items-center right-0 absolute gap-2 '>
              <span className="text-black text-[16px] py-1 px-2 rounded-md flex items-center gap-1">
                <RiArrowDownBoxFill size={22} className='text-red-500' />
                <sup>{emp.pending ?? 0}</sup>
              </span>
              <span className="text-black text-[16px] py-1 px-2 rounded-md flex items-center gap-1">
                <RiArrowUpBoxFill size={22} className='text-green-500' />
                <sup>{emp.completed ?? 0}</sup>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
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
