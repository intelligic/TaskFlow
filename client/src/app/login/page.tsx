"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCaptcha } from "@/lib/captcha";
import { TbRefresh } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/auth-schema";
import { loginUser } from "@/lib/api/authApi";
import { getUserRole, setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [captcha, setCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const role = getUserRole(token);

      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "employee") {
        router.replace("/employee/dashboard");
      }
    } catch {
      localStorage.removeItem("token");
    }
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
    setValue("captchaInput", "");
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");

    try {
      setLoading(true);
      const res = await loginUser(data.email, data.password);
      const token = res?.token;
      const role = (res as { user?: { role?: unknown } })?.user?.role;

      if (!token) {
        setServerError("Invalid email or password");
        return;
      }

      setToken(token);

      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "employee") {
        router.replace("/employee/dashboard");
      } else {
        router.replace("/login");
      }
    } catch (error: unknown) {
      setServerError("Invalid email or password");
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
        <h2 className="mb-6 font-serif text-2xl font-semibold text-black">
          Login
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {errors.email && (
              <p className="mb-2 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
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
            {errors.password && (
              <p className="mb-2 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-3 flex items-center gap-3">
            <div className="bg-gray-200 px-4 py-2 font-serif text-lg tracking-widest text-black">
              {captcha}
            </div>
            <button
              type="button"
              onClick={refreshCaptcha}
              className="text-sm text-blue-600"
            >
              <TbRefresh className="text-[25px]" />
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter captcha"
          autoComplete="off"
          {...register("captchaInput")}
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {errors.captchaInput && (
          <p className="mb-2 text-sm text-red-500">
            {errors.captchaInput.message}
          </p>
        )}

        <input type="hidden" {...register("captchaGenerated")} />

        {serverError && (
          <p className="mt-3 text-sm text-red-600">{serverError}</p>
        )}

        <button
          disabled={loading}
          className="mt-3 w-full rounded bg-blue-600 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center font-serif text-sm text-gray-700">
          New user?
          <Link href="/register" className="ml-1 text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
