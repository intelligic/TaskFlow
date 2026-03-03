'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 🔴 TEMP: dummy login logic
    if (email === 'admin@test.com') {
      localStorage.setItem('role', 'admin');
      router.push('/admin/dashboard');
    } else {
      localStorage.setItem('role', 'employee');
      router.push('/employee/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg border w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-1 text-center">Login</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Login as Admin or Employee
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2 mb-3 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2 mb-4 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:opacity-90"
        >
          Login
        </button>

        <p className="text-xs text-center mt-4 text-gray-500">
          New employee? Ask admin for invite link
        </p>
      </div>
    </div>
  );
}