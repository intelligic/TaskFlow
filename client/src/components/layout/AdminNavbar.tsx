"use client";

import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
// import { ClipboardList } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MdPersonAddAlt1, MdOutlineAddTask } from "react-icons/md";
import NotificationBell from "@/components/layout/NotificationBell";
import { logout } from "@/lib/auth";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const normalizePath = (path: string) => {
    const normalized = path.replace(/\/+$/, "");
    return normalized || "/";
  };

  const isActive = (path: string) => {
    const current = normalizePath(pathname);
    const target = normalizePath(path);

    if (current === target) return true;
    if (target === "/admin/dashboard" && current === "/admin") return true;
    return current.startsWith(`${target}/`);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCreateTask = () => {
    if (pathname === "/admin/dashboard") {
      window.dispatchEvent(new CustomEvent("open-task-modal"));
    } else {
      router.push("/admin/dashboard?create=true");
    }
  };

  return (
    <div className="h-14 bg-white shadow-lg font-sans flex items-center justify-between px-6">
      <div className="flex items-center gap-5 pt-3">
        {/* <div className="flex justify-center items-center gap-2 text-md text-black font-bold tracking-wider">
          <ClipboardList size={25} className="text-black" />
          TaskManager
        </div> */}
        <div className="flex justify-center items-center gap-2 text-md text-black font-bold tracking-wider">
          <Image src="/TaskFlowLogo.png" alt="logo" width={200} height={200} />
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className={`text-[16px] font-semibold tracking-wide transition-colors duration-300 ease-in-out ${isActive("/admin/dashboard")
              ? "text-indigo-700"
              : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/employees"
            className={`text-[16px] font-semibold tracking-wide transition-colors duration-300 ease-in-out ${isActive("/admin/employees")
              ? "text-indigo-700"
              : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Employees
          </Link>
          <Link
            href="/admin/archive"
            className={`text-[16px] font-semibold tracking-wide transition-colors duration-300 ease-in-out ${isActive("/admin/archive")
              ? "text-indigo-700"
              : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Archive
          </Link>
          {/* <button
            onClick={handleCreateTask}
            className={`text-[14px] font-semibold tracking-wide transition-colors duration-300 ease-in-out text-slate-500 hover:text-indigo-600`}
          >
            Create Task
          </button> */}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link
          href="/admin/employees/invite"
          className="border border-gray-500 px-3 py-1.5 font-bold tracking-wide rounded-lg text-sm hover:bg-gray-200 duration-700 ease-in-out flex items-center gap-2 text-gray-900"
        >
          <MdPersonAddAlt1 className="text-lg" />
          Add Employee
        </Link>
        <Link
          href="/admin/task/create"
          className="bg-blue-600 text-white px-3 py-1.5 font-bold tracking-wide rounded-lg text-sm flex items-center gap-2 transition-colors hover:bg-blue-700"
        >
          <MdOutlineAddTask className="text-lg" />
          Create Task
        </Link>

        <div
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600"
          aria-label="User profile"
          title="User"
        >
          <FaUserAlt size={18} />
        </div>

        <button
          onClick={handleLogout}
          className="rounded p-1.5 text-red-800 hover:text-red-400 font-bold"
          aria-label="Logout"
          title="Logout"
        >
          <RiLogoutCircleRLine size={22} />
        </button>
      </div>
    </div>
  );
}
