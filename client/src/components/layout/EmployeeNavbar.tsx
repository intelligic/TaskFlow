"use client";

import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import NotificationBell from "@/components/layout/NotificationBell";
import { logout } from "@/lib/auth";
import { updateStatus } from "@/lib/api/employeeApi";
import { getProfile } from "@/lib/api/authApi";
import { getApiErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";

export default function EmployeeNavbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await getProfile();
        setIsOnline(profile.isOnline || false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchStatus();
  }, []);

  const handleToggleStatus = async () => {
    try {
      setStatusLoading(true);
      const newStatus = !isOnline;
      await updateStatus(newStatus);
      setIsOnline(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(getApiErrorMessage(error, 'Failed to update status'));
    } finally {
      setStatusLoading(false);
    }
  };

  const normalizePath = (path: string) => {
    const normalized = path.replace(/\/+$/, "");
    return normalized || "/";
  };

  const isActive = (path: string) => {
    const current = normalizePath(pathname);
    const target = normalizePath(path);

    if (current === target) return true;
    if (target === "/employee/dashboard" && current === "/employee")
      return true;
    return current.startsWith(`${target}/`);
  };

  const linkClass = (path: string) =>
    `relative text-[15px] font-semibold tracking-wide transition-colors ${
      isActive(path)
        ? "text-blue-700"
        : "text-slate-500 hover:text-blue-700"
    }`;

  return (
    <header className="h-14 bg-slate-100/80 shadow-[0_2px_10px_rgba(15,23,42,0.08)] font-sans flex items-center justify-between px-8">
      <div className="flex items-center gap-6">
        <Image src="/TaskFlowLogo.png" alt="logo" width={160} height={40} />

        <div className="flex items-center gap-4">
          <Link
            href="/employee/dashboard"
            className={linkClass("/employee/dashboard")}
          >
            Dashboard
            {isActive("/employee/dashboard") && (
              <span className="absolute left-0 -bottom-4 h-0.5 w-full rounded-full bg-blue-600" />
            )}
          </Link>
          <Link
            href="/employee/archive"
            className={linkClass("/employee/archive")}
          >
            Archive
            {isActive("/employee/archive") && (
              <span className="absolute left-0 -bottom-4 h-0.5 w-full rounded-full bg-blue-600" />
            )}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <span className={`text-[12px] font-bold tracking-wider ${isOnline ? "text-green-600" : "text-gray-500"}`}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
          <button
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className={`text-[34px] transition-colors duration-300 ${
              isOnline ? "text-green-600" : "text-gray-400"
            } disabled:opacity-50`}
            title={isOnline ? "Go Offline" : "Go Online"}
          >
            {isOnline ? <MdToggleOn /> : <MdToggleOff />}
          </button>
        </div>
        <NotificationBell />
        {/* <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm"
          aria-label="User profile"
          title="User"
        >
          <FaUserAlt size={18} />
        </div> */}

        <button
          onClick={() => {
            logout();
          }}
          className="rounded text-red-600 hover:text-red-500 font-bold"
          aria-label="Logout"
          title="Logout"
        >
          <RiLogoutCircleRLine size={22} />
        </button>
      </div>
    </header>
  );
}
