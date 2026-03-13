'use client';

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken, getUserRole, logout } from '@/lib/auth';

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

  const token = isClient ? getToken() : null;
  const userRole = token ? getUserRole(token) : null;

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!token || !userRole) {
      router.replace('/login');
      return;
    }

    if (!role || userRole === role) {
      return;
    }
  }, [isClient, pathname, role, router, token, userRole]);

  if (!isClient || !token || !userRole) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Checking access...</div>;
  }

  if (role && userRole !== role) {
    return (
      <div className="flex h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Access denied. You are logged in as <span className="font-bold">{userRole}</span>, but this page requires{' '}
            <span className="font-bold">{role}</span>.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.replace(userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard')
              }
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Go to my dashboard
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
