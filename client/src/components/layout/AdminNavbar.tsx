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
    <div className="h-14 bg-slate-100/80 shadow-[0_2px_10px_rgba(15,23,42,0.08)] font-sans flex items-center justify-between px-8">
      <div className="flex items-center gap-6">
          <Image src="/TaskFlowLogo.png" alt="logo" width={160} height={40} />
          
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className={`relative text-[15px] font-semibold tracking-wide transition-colors ${isActive("/admin/dashboard")
              ? "text-indigo-700"
              : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/employees"
            className={`relative text-[15px] font-semibold tracking-wide transition-colors ${isActive("/admin/employees")
              ? "text-indigo-700"
              : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Employees
          </Link>
          <Link
            href="/admin/archive"
            className={`relative text-[15px] font-semibold tracking-wide transition-colors ${isActive("/admin/archive")
              ? "text-indigo-700"
              : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Archive
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
          className="rounded text-red-600 hover:text-red-500 font-bold"
          aria-label="Logout"
          title="Logout"
        >
          <RiLogoutCircleRLine size={22} />
        </button>
      </div>
    </div>
  );
}
