"use client";

import { useEffect, useMemo, useState } from "react";
import EmployeeList from "@/components/dashboard/EmployeeList";
import { getEmployees, type EmployeeItem } from "@/lib/api/employeeApi";
import { getApiErrorMessage } from "@/lib/api";
import { FiSearch } from "react-icons/fi";
import { socket } from "@/lib/socket";
import Image from "next/image";

const ITEMS_PER_PAGE = 8;

export default function AdminEmployeesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);

  const refresh = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getEmployees();
      setEmployees(Array.isArray(res.employees) ? res.employees : []);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Unable to load employees"));
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    // `ProtectedRoute` manages socket connection; only register listener here.
    socket.on("userStatusUpdated", refresh);

    return () => {
      socket.off("userStatusUpdated", refresh);
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        String(emp.designation || "")
          .toLowerCase()
          .includes(query),
    );
  }, [employees, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmployees, safePage]);

  const startItem =
    filteredEmployees.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredEmployees.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-1 min-h-0 flex-col gap-4 rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-t-2xl bg-slate-400/70 px-5 py-3 gap-4">
          <div className="flex flex-col gap-1 items-start justify-start w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-wide font-heading">
              All Employees
            </h2>
            <p className="text-xs sm:text-sm font-semibold font-sans text-slate-700 tracking-wide">
              Manage your team members and their activity.
            </p>
          </div>

          <div className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm w-full sm:w-auto min-w-0">
            <FiSearch className="text-[16px] text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full sm:w-48 md:w-64 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="bg-white p-3">
          {loading ? (
            <p className="px-2 py-3 text-sm font-semibold text-slate-600">
              Loading...
            </p>
          ) : error ? (
            <p className="px-2 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : paginatedEmployees.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-between gap-8 md:grid-cols-2">
                <div className="w-full max-w-sm mx-auto">
                  <Image
                    src="/NoTaskImg.webp"
                    width={420}
                    height={320}
                    className="h-80 w-full object-cover"
                    alt="No employees"
                  />
                </div>
                <div className="text-center md:text-left flex items-center justify-center flex-col gap-5">
                  <h4 className="text-3xl font-extrabold text-slate-800">
                    No employees found
                  </h4>
                  <p className="text-[16px] text-slate-500 text-center">
                    You currently have no employees.
                    <br />
                    Please add employees to manage your workspace effectively.
                  </p>
                  <button
                    onClick={refresh}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmployeeList data={paginatedEmployees} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-white px-4 py-2 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-extrabold text-slate-800 tracking-wide font-heading">
          Showing {startItem}-{endItem} of {filteredEmployees.length}
        </p>

        <div className="flex items-center justify-center sm:justify-end gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safePage === 1}
            className="rounded border border-black px-3 sm:px-4 text-black py-1 sm:py-1.5 text-xs sm:text-sm disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
          >
            Prev
          </button>

          <div className="flex items-center gap-1 sm:gap-2 mx-1">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              const active = page === safePage;
              
              // Only show active page and neighbors on mobile
              if (totalPages > 5 && Math.abs(page - safePage) > 1 && page !== 1 && page !== totalPages) {
                if (Math.abs(page - safePage) === 2) return <span key={page}>...</span>;
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded border px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={safePage === totalPages}
            className="rounded border border-black px-3 sm:px-4 text-black py-1 sm:py-1.5 text-xs sm:text-sm disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* Add Employee (Invite flow yahin se) */

/* <Link
          href="/admin/employees/invite"
          className="bg-black text-white px-4 py-2 rounded text-sm hover:opacity-90"
        >
          + Add Employee
  </Link> */
