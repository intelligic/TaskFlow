'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/lib/api';

export default function AdminSetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/setup-admin', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      router.replace('/admin/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Setup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-semibold">Setup Admin Account</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          className="w-full rounded border px-3 py-2"
          autoComplete="name"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
          autoComplete="email"
          onChange={handleChange}
          required
        />

        <div className="relative">
          <input
            name="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            className="w-full rounded border px-3 py-2 pr-14"
            autoComplete="new-password"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute right-2 top-2 text-sm text-gray-500"
          >
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPass ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="w-full rounded border px-3 py-2 pr-14"
            autoComplete="new-password"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPass((prev) => !prev)}
            className="absolute right-2 top-2 text-sm text-gray-500"
          >
            {showConfirmPass ? 'Hide' : 'Show'}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
