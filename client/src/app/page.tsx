'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/auth/admin-exists');
        if (res.data.exists) {
          router.replace('/login');
        } else {
          router.replace('/setup-admin');
        }
      } catch (error: unknown) {
        console.error('Admin check failed', error);
        router.replace('/setup-admin');
      }
    };
    checkAdmin();
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center text-gray-500">
      Checking setup...
    </div>
  );
}
