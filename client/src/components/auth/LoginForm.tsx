'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const res = await api.get('/auth/admin-exists');
        if (!res.data?.exists) {
          router.replace('/setup-admin');
        }
      } catch {
        setError('Unable to verify admin setup. Try again.');
      }
    };
    checkAdminExists();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });

      const { token, role } = res.data;
      localStorage.setItem('token', token);

      if (role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/employee/dashboard');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            className="w-full rounded border px-3 py-2 pr-14"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <button
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
