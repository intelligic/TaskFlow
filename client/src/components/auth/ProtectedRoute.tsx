'use client';

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/auth';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'admin' | 'employee';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const token = isClient ? localStorage.getItem('token') : null;
  const userRole = token ? getUserRole(token) : null;

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!token || !userRole) {
      localStorage.removeItem('token');
      router.replace('/login');
      return;
    }

    if (!role || userRole === role) {
      return;
    }

    if (userRole === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/employee/dashboard');
    }
  }, [isClient, pathname, role, router, token, userRole]);

  if (!isClient || !token || !userRole) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Checking access...</div>;
  }

  if (role && userRole !== role) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Redirecting...</div>;
  }

  return <>{children}</>;
}
