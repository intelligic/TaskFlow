'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const role = getUserRole(token);

    if (role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }

    if (role === 'employee') {
      router.replace('/employee/dashboard');
      return;
    }

    localStorage.removeItem('token');
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      Redirecting...
    </div>
  );
}
