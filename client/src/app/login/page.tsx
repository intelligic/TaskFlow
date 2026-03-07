"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCaptcha } from "@/lib/captcha";
import { TbRefresh } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/auth-schema";

export default function LoginPage() {
  const router = useRouter();
  const [captcha, setCaptcha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

  const onSubmit = (data: LoginFormData) => {
    console.log({
      email: data.email,
      password: data.password,
    });

    /* TEMP ROLE LOGIC */

    if (data.email.includes("admin")) {
      router.push("/admin/dashboard");
    } else {
      router.push("/employee/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-105"
      >
        <h2 className="text-2xl font-semibold mb-6 text-black font-serif">Login</h2>

        <div className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mb-2">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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
              <p className="text-red-500 text-sm mb-2">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-200 px-4 py-2 font-serif text-lg tracking-widest text-black">
              {captcha}
            </div>

            <button
              type="button"
              onClick={refreshCaptcha}
              className="text-blue-600 text-sm"
            >
              <TbRefresh className="text-[25px]" />
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Enter captcha"
          {...register("captchaInput")}
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        {errors.captchaInput && (
          <p className="text-red-500 text-sm mb-2">
            {errors.captchaInput.message}
          </p>
        )}

        <input type="hidden" {...register("captchaGenerated")} />

        <button className="w-full bg-blue-600 text-white py-2 rounded mt-3">
          Login
        </button>

        <p className="text-sm mt-4 font-serif text-gray-700 text-center">
          New user?
          <a href="/register" className="text-blue-600 ml-1">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
