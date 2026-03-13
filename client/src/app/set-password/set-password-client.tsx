"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { setEmployeePassword, verifyInviteToken } from "@/lib/api/authApi";

export default function SetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!token) {
        setError("Missing invite token");
        setLoading(false);
        return;
      }

      try {
        setError("");
        setLoading(true);
        const res = await verifyInviteToken(token);
        if (cancelled) return;
        setName(res.user?.name || "");
        setEmail(res.user?.email || "");
        setDesignation(res.user?.designation || "");
      } catch {
        if (cancelled) return;
        setError("Invalid or expired invite link");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!token) return;

          if (name.trim().length < 3) {
            setError("Name must be at least 3 characters");
            return;
          }

          if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
          }

          if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
          }

          try {
            setError("");
            setSuccess("");
            setSubmitting(true);
            await setEmployeePassword(token, password, name.trim());
            setSuccess("Password set successfully. Redirecting to login...");
            setTimeout(() => router.push("/login"), 800);
          } catch {
            setError("Failed to set password. Try again.");
          } finally {
            setSubmitting(false);
          }
        }}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
      >
        <h2 className="mb-2 text-2xl font-semibold text-black">Set Password</h2>
        <p className="mb-6 text-sm font-semibold text-gray-500">
          Complete your account setup to access TaskFlow.
        </p>

        {loading ? (
          <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-600">
            Loading invite...
          </p>
        ) : (
          <>
            {!!error && (
              <p className="mb-4 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            {!!success && (
              <p className="mb-4 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-green-700">
                {success}
              </p>
            )}

            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Your name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"
              />
            </div>

            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700"
              />
            </div>

            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Set a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !!error}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Set Password"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
