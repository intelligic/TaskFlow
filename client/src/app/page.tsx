'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/api/authApi';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getProfile();
        if (profile?.role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }
        if (profile?.role === 'employee') {
          router.replace('/employee/dashboard');
          return;
        }
        router.replace('/login');
      } catch {
        router.replace('/login');
      }
    };
    load();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center text-gray-500">
      Redirecting...
    </div>
  );
}
