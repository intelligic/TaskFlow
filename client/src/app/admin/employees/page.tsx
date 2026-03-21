"use client";

import { useEffect, useMemo, useState } from "react";
import EmployeeList from "@/components/dashboard/EmployeeList";
import { getEmployees, type EmployeeItem } from "@/lib/api/employeeApi";
import { getApiErrorMessage } from "@/lib/api";
import { FiSearch } from "react-icons/fi";
import { socket } from "@/lib/socket";

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
        <div className="flex items-center justify-between rounded-t-2xl bg-slate-400/70 px-5 py-2">
          <div className="flex flex-col gap-1 items-start justify-start">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-wide font-heading">
              All Employees
            </h2>
            <p className="text-sm font-semibold font-sans text-slate-700 tracking-wide">
              A Text only Historical record of your complete and close tasks.
            </p>
          </div>

          <div className="relative flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm">
            <FiSearch className="text-[16px] text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email or designation..."
              className="w-56 md:w-72 bg-transparent text-[13px] text-slate-7200 outline-none placeholder:text-slate-400"
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
            // <p className="px-2 py-3 text-sm font-semibold text-slate-600">
            //   No employees yet.
            // </p>
            <div className="flex flex-1 items-center justify-center py-10">
              <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-between gap-8 md:grid-cols-2">
                <div className="w-130 mx-auto">
                  <img
                    src="/NoTaskImg.webp"
                    className="h-80 w-full object-cover"
                    alt="NO Task Image"
                  />
                </div>
                <div className="text-center md:text-left flex items-center justify-center flex-col gap-5">
                  <h4 className="text-3xl font-extrabold text-slate-800">
                    No tasks assigned yet
                  </h4>
                  <p className="text-[16px] text-slate-500 text-center">
                    You currently have No employees yet.
                    <br />
                    Please Add employees to manage your workspace effectively!
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
        <p className="text-md font-extrabold text-slate-800 tracking-wide font-heading">
          Showing {startItem}-{endItem} of {filteredEmployees.length} employees
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safePage === 1}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            const active = page === safePage;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded border px-3 py-1.5 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={safePage === totalPages}
            className="rounded border border-black px-4 text-black py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
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
