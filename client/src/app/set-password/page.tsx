'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSetPassword = () => {
    if (!password || password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    alert('Password set successfully. Please login.');
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg border w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-1 text-center">
          Set Your Password
        </h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Create password to activate your account
        </p>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded px-3 py-2 mb-3 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border rounded px-3 py-2 mb-4 text-sm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={handleSetPassword}
          className="w-full bg-blue-600 text-white py-2 rounded hover:opacity-90"
        >
          Set Password
        </button>
      </div>
    </div>
  );
}