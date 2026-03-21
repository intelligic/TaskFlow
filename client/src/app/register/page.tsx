"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateCaptcha } from "@/lib/captcha";
import { registerSchema, RegisterFormData } from "@/lib/auth-schema";
import { TbRefresh } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { getProfile, registerUser } from "@/lib/api/authApi";
import { getApiErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [captcha, setCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getProfile();
        const role = profile?.role;
        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else if (role === "employee") {
          router.replace("/employee/dashboard");
        }
      } catch {
        // Not logged in
      }
    };
    load();
  }, [router]);

  useEffect(() => {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    setValue("captchaGenerated", newCaptcha);
  }, [setValue]);

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    setValue("captchaGenerated", newCaptcha);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      setLoading(true);
      const res = await registerUser(data.name, data.email, data.password, data.workspaceName);
      const role = res.user?.role;
      if (role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }
      if (role === "employee") {
        router.replace("/employee/dashboard");
        return;
      }
      const profile = await getProfile();
      if (profile?.role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }
      if (profile?.role === "employee") {
        router.replace("/employee/dashboard");
        return;
      }
      router.replace("/login");
      return;
    } catch (e: unknown) {
      console.error("Registration failed:", e);
      setServerError(getApiErrorMessage(e, "Registration failed. Try again."));
      refreshCaptcha();
      return;
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-105 rounded-xl bg-white p-8 shadow-md"
      >
        <h2 className="mb-6 text-2xl font-semibold text-black">Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          autoComplete="name"
          {...register("name")}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {errors.name && <p className="mb-2 text-sm text-red-500">{errors.name.message}</p>}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register("email")}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {errors.email && <p className="mb-2 text-sm text-red-500">{errors.email.message}</p>}

        <input
          type="text"
          placeholder="Workspace Name (e.g. My Company)"
          autoComplete="organization"
          {...register("workspaceName")}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {errors.workspaceName && <p className="mb-2 text-sm text-red-500">{errors.workspaceName.message}</p>}

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password"
            {...register("password")}
            className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
        {errors.password && <p className="mb-2 text-sm text-red-500">{errors.password.message}</p>}

        <div className="relative mb-3">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="w-full rounded-lg border border-slate-200 px-3 py-3 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
        {errors.confirmPassword && <p className="mb-2 text-sm text-red-500">{errors.confirmPassword.message}</p>}

        <div className="mb-3 flex items-center gap-3">
          <div className="font-sans bg-gray-200 px-4 py-2 text-lg tracking-widest text-black">{captcha}</div>
          <button type="button" onClick={refreshCaptcha} className="text-sm text-blue-600">
            <TbRefresh className="text-[25px]" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter captcha"
          autoComplete="off"
          {...register("captchaInput")}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {errors.captchaInput && <p className="mb-2 text-sm text-red-500">{errors.captchaInput.message}</p>}

        <input type="hidden" {...register("captchaGenerated")} />

        {serverError && <p className="mb-2 text-sm text-red-600">{serverError}</p>}
        {successMessage && <p className="mb-2 text-sm text-green-600">{successMessage}</p>}

        <button
          disabled={loading}
          className="mt-3 w-full rounded bg-green-600 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-700">
          Already have an account?
          <Link href="/login" className="ml-1 text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
