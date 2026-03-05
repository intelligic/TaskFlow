"use client";

import { LogOut, User } from "lucide-react";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { MdPersonAddAlt1, MdOutlineAddTask } from "react-icons/md";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const normalizePath = (path: string) => {
    const normalized = path.replace(/\/+$/, '');
    return normalized || '/';
  };

  const isActive = (path: string) => {
    const current = normalizePath(pathname);
    const target = normalizePath(path);

    if (current === target) return true;
    if (target === '/admin/dashboard' && current === '/admin') return true;
    return current.startsWith(`${target}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="h-14 bg-white shadow-lg font-serif flex items-center justify-between px-6">
      <div className="flex items-center gap-10">
        <div>
          <Link
            href="/admin/dashboard"
            className="flex justify-center items-center gap-2 text-md text-black font-bold tracking-wider"
          >
            <ClipboardList size={25} className="text-black" />
            TaskManager
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className={`text-[14px] font-semibold tracking-wide transition-colors duration-300 ease-in-out ${
              isActive("/admin/dashboard")
                ? "text-indigo-700"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/employees"
            className={`text-[14px] font-semibold tracking-wide transition-colors duration-300 ease-in-out ${
              isActive("/admin/employees")
                ? "text-indigo-700"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Employees
          </Link>
          <Link
            href="/admin/archive"
            className={`text-[14px] font-semibold tracking-wide transition-colors duration-300 ease-in-out ${
              isActive("/admin/archive")
                ? "text-indigo-700"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Archive
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/employees/invite"
          className="border border-gray-500 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 duration-700 ease-in-out flex items-center gap-2 text-gray-900"
        >
          <MdPersonAddAlt1 className="text-lg" />
          Add Employee
        </Link>

        <Link
          href="/admin/task/create"
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <MdOutlineAddTask className="text-lg" />
          Create Task
        </Link>

        <div
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600"
          aria-label="User profile"
          title="User"
        >
          <User size={18} />
        </div>

        <button
          onClick={handleLogout}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-black"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
