"use client";

import Link from "next/link";
import { ArrowLeft, Info, Mail, User, UserPlus } from "lucide-react";

export default function InviteEmployeePage() {
  return (
    <div className="mx-auto w-full max-w-180 py-2">
      <Link
        href="/admin/employees"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft size={15} />
        Back to Employee List
      </Link>

      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">
          Add Employee
        </h1>
        <p className="w-160 text-md text-slate-500 font-medium">
          Register a new team member to grant access to the task management
          system.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Enter employee's full name"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. name@company.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            <UserPlus size={16} />
            Add Employee
          </button>
        </form>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-slate-600">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p>
          The employee will receive an invitation email to set their password
          and complete their profile registration.
        </p>
      </div>
    </div>
  );
}
