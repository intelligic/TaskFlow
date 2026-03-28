"use client";

import { useEffect, useState } from "react";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import NotificationBell from "@/components/layout/NotificationBell";
import { logout } from "@/lib/auth";
import { updateStatus } from "@/lib/api/employeeApi";
import { getProfile } from "@/lib/api/authApi";
import { getApiErrorMessage } from "@/lib/api";
import { isRecentlyActive } from "@/lib/online";
import { toast } from "@/components/ui/toast";

export default function EmployeeNavbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState<string | undefined>(undefined);
  const [statusLoading, setStatusLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await getProfile();
        setIsOnline(profile?.isOnline || false);
        setLastActive(profile?.lastActive);
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
      const updated = await updateStatus(newStatus);
      setIsOnline(newStatus);
      if (updated?.lastActive) {
        setLastActive(updated.lastActive);
      } else {
        setLastActive(new Date().toISOString());
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(getApiErrorMessage(error, "Failed to update status"));
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
      isActive(path) ? "text-blue-700" : "text-slate-500 hover:text-blue-700"
    }`;

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

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/employee/dashboard"
              className={`${linkClass("/employee/dashboard")} lg:text-[16px]`}
            >
              Dashboard
              {isActive("/employee/dashboard") && (
                <span className="absolute left-0 -bottom-4 h-0.5 w-full rounded-full bg-blue-600" />
              )}
            </Link>
            <Link
              href="/employee/archive"
              className={`${linkClass("/employee/archive")} lg:text-[16px]`}
            >
              Archive
              {isActive("/employee/archive") && (
                <span className="absolute left-0 -bottom-4 h-0.5 w-full rounded-full bg-blue-600" />
              )}
            </Link>
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            {(() => {
              const online = isRecentlyActive(lastActive, isOnline);
              return (
            <span
              className={`text-[12px] font-bold tracking-wider ${online ? "text-green-600" : "text-gray-500"}`}
            >
              {online ? "ONLINE" : "OFFLINE"}
            </span>
              );
            })()}
            <button
              onClick={handleToggleStatus}
              disabled={statusLoading}
              className={`text-[34px] transition-colors duration-300 ${
                isRecentlyActive(lastActive, isOnline) ? "text-green-600" : "text-gray-400"
              } disabled:opacity-50`}
              title={isRecentlyActive(lastActive, isOnline) ? "Go Offline" : "Go Online"}
            >
              {isRecentlyActive(lastActive, isOnline) ? <MdToggleOn /> : <MdToggleOff />}
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
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <Link
                href="/employee/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`text-[15px] font-semibold tracking-wide transition-colors ${
                  isActive("/employee/dashboard")
                    ? "text-blue-700 font-bold"
                    : "text-slate-600 hover:text-blue-700"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/employee/archive"
                onClick={() => setMobileOpen(false)}
                className={`text-[15px] font-semibold tracking-wide transition-colors ${
                  isActive("/employee/archive")
                    ? "text-blue-700 font-bold"
                    : "text-slate-600 hover:text-blue-700"
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
                  <div className="flex items-center gap-2">
                    {(() => {
                      const online = isRecentlyActive(lastActive, isOnline);
                      return (
                    <span
                      className={`text-[12px] font-bold tracking-wider ${online ? "text-green-600" : "text-gray-500"}`}
                    >
                      {online ? "ONLINE" : "OFFLINE"}
                    </span>
                      );
                    })()}
                    <button
                      onClick={handleToggleStatus}
                      disabled={statusLoading}
                      className={`text-[32px] transition-colors duration-300 ${
                        isRecentlyActive(lastActive, isOnline) ? "text-green-600" : "text-gray-400"
                      } disabled:opacity-50`}
                      title={isRecentlyActive(lastActive, isOnline) ? "Go Offline" : "Go Online"}
                    >
                      {isRecentlyActive(lastActive, isOnline) ? <MdToggleOn /> : <MdToggleOff />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 rounded text-red-600 hover:text-red-500 font-bold"
                  aria-label="Logout"
                  title="Logout"
                >
                  <RiLogoutCircleRLine size={22} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


            // <div className="h-px w-full bg-slate-200" />
