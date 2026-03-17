'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logout, logoutSilent } from '@/lib/auth';
import { getProfile } from '@/lib/api/authApi';
import { socket } from '@/lib/socket';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'admin' | 'employee';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'authorized' | 'forbidden'>('loading');
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;
        const roleFromServer = profile?.role || null;
        if (!roleFromServer) {
          if (socket.connected) socket.disconnect();
          router.replace('/login');
          return;
        }

        setUserRole(roleFromServer);
        if (role && roleFromServer !== role) {
          setStatus('forbidden');
          return;
        }

        if (!socket.connected) socket.connect();
        setStatus('authorized');
        setIsAuthorized(true);
      } catch {
        if (cancelled) return;
        if (socket.connected) socket.disconnect();
        router.replace('/login');
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pathname, role, router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const IDLE_MS = 30 * 60 * 1000;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        logout();
      }, IDLE_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    events.forEach((evt) => window.addEventListener(evt, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetIdle));
    };
  }, [isAuthorized]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center text-gray-500">Checking access...</div>;
  }

  if (status === 'forbidden') {
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
