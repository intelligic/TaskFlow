"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateCaptcha } from "@/lib/captcha";
import { validateEmail, validatePassword } from "@/lib/validation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { TbRefresh } from "react-icons/tb";

export default function EmployeeVerify() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (name.length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (inputCaptcha !== captcha) {
      setError("Captcha incorrect");
      return;
    }

    setError("");

    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-105"
      >
        <h2 className="text-2xl font-semibold mb-6 text-black">Employee Verification</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-3"
        />

        <input
          type="email"
          placeholder="Work Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-3"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Set Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        <input
          type="text"
          placeholder="Enter captcha"
          value={inputCaptcha}
          onChange={(e) => setInputCaptcha(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 mb-3"
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Verify & Create Account
        </button>
      </form>
    </div>
  );
}