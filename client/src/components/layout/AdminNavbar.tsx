"use client";

import { useState } from "react";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MdPersonAddAlt1, MdOutlineAddTask } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import NotificationBell from "@/components/layout/NotificationBell";
import { logout } from "@/lib/auth";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="bg-slate-100/80 shadow-[0_2px_10px_rgba(15,23,42,0.08)] font-sans">
      <div className="h-14 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <Image
            src="/TaskFlowLogo.png"
            alt="logo"
            width={160}
            height={40}
            className="h-auto w-50 md:w-55"
          />

          <nav className="hidden lg:flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className={`relative text-[15px] lg:text-[16px] font-semibold tracking-wide transition-colors ${
                isActive("/admin/dashboard")
                  ? "text-indigo-700"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/employees"
              className={`relative text-[15px] lg:text-[16px] font-semibold tracking-wide transition-colors ${
                isActive("/admin/employees")
                  ? "text-indigo-700"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Employees
            </Link>
            <Link
              href="/admin/archive"
              className={`relative text-[15px] lg:text-[16px] font-semibold tracking-wide transition-colors ${
                isActive("/admin/archive")
                  ? "text-indigo-700"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Archive
            </Link>
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <NotificationBell />
          <Link
            href="/admin/employees/invite"
            className="border border-gray-500 px-3 py-1.5 font-bold tracking-wide rounded-lg text-sm lg:text-[15px] hover:bg-gray-200 duration-700 ease-in-out flex items-center gap-2 text-gray-900"
          >
            <MdPersonAddAlt1 className="text-lg" />
            Add Employee
          </Link>
          <button
            onClick={handleCreateTask}
            className="bg-blue-600 text-white px-3 py-1.5 font-bold tracking-wide rounded-lg text-sm lg:text-[15px] flex items-center gap-2 transition-colors hover:bg-blue-700"
          >
            <MdOutlineAddTask className="text-lg" />
            Create Task
          </button>

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

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4">
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`text-[15px] font-semibold tracking-wide transition-colors ${
                  isActive("/admin/dashboard")
                    ? "text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/employees"
                onClick={() => setMobileOpen(false)}
                className={`text-[15px] font-semibold tracking-wide transition-colors ${
                  isActive("/admin/employees")
                    ? "text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                Employees
              </Link>
              <Link
                href="/admin/archive"
                onClick={() => setMobileOpen(false)}
                className={`text-[15px] font-semibold tracking-wide transition-colors ${
                  isActive("/admin/archive")
                    ? "text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                Archive
              </Link>
            </div>

            <div className="h-px w-full bg-slate-200" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600"
                    aria-label="User profile"
                    title="User"
                  >
                    <FaUserAlt size={18} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 rounded text-red-600 hover:text-red-500 font-bold"
                  aria-label="Logout"
                  title="Logout"
                >
                  <RiLogoutCircleRLine size={22} />
                  <span>Logout</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/admin/employees/invite"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  <MdPersonAddAlt1 className="text-lg" />
                  Add Employee
                </Link>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleCreateTask();
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200"
                >
                  <MdOutlineAddTask className="text-lg" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// <div className="flex flex-wrap gap-4">
//   <button
//     onClick={() => {
//       setMobileOpen(false);
//       handleCreateTask();
//     }}
//     className="flex-1 min-w-35 bg-blue-600 text-white px-3 py-2 font-bold tracking-wide rounded-lg text-sm flex items-center justify-center gap-2 transition-colors hover:bg-blue-700"
//   >
//     <MdOutlineAddTask className="text-lg" />
//     Create Task
//   </button>

//   <button
//     onClick={() => {
//       setMobileOpen(false);
//       handleLogout();
//     }}
//     className="flex items-center gap-2 rounded text-red-600 hover:text-red-500 font-bold"
//     aria-label="Logout"
//     title="Logout"
//   >
//     <RiLogoutCircleRLine size={20} />
//   </button>
// </div>
