"use client";

import Link from "next/link";
import { ArrowLeft, Info, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { inviteEmployee } from "@/lib/api/employeeApi";

export default function InviteEmployeePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("Senior Developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setError("");
              setSuccess("");
              setLoading(true);
              const res = await inviteEmployee(name.trim(), email.trim(), designation);
              setSuccess(res.message || "Invite sent");
              setName("");
              setEmail("");
              setDesignation("Senior Developer");
            } catch (err: any) {
              const apiMessage = err?.response?.data?.message;
              setError(apiMessage || "Failed to send invite");
            } finally {
              setLoading(false);
            }
          }}
        >
          {!!error && (
            <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {!!success && (
            <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </p>
          )}

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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Designation
            </label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="Senior Developer">Senior Developer</option>
              <option value="Junior Developer">Junior Developer</option>
              <option value="Intern">Intern</option>
              <option value="Operator">Operator</option>
              <option value="Account Manager">Account Manager</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            <UserPlus size={16} />
            {loading ? "Sending..." : "Add Employee"}
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
