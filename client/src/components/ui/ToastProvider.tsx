'use client';

import { useEffect, useState } from 'react';
import type { ToastType } from './toast';
import { subscribeToToasts, toast } from './toast';

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

const typeStyles: Record<ToastType, { container: string; icon: string; label: string }> = {
  success: {
    container: 'border-green-200 bg-green-50 text-green-800',
    icon: 'bg-green-600',
    label: 'Success',
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-800',
    icon: 'bg-red-600',
    label: 'Error',
  },
  info: {
    container: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: 'bg-blue-600',
    label: 'Info',
  },
};

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((payload) => {
      const trimmed = payload.message?.trim();
      if (!trimmed) return;
      const id = createId();
      const durationMs = payload.durationMs ?? 3500;
      setToasts((prev) => [...prev, { id, message: trimmed, type: payload.type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, durationMs);
    });
    return unsubscribe;
  }, []);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[92vw] max-w-sm flex-col gap-2 sm:w-auto">
        {toasts.map((toast) => {
          const styles = typeStyles[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${styles.container}`}
            >
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${styles.icon}`} />
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{styles.label}</p>
                <p className="text-sm font-semibold leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold opacity-60 hover:opacity-100"
                onClick={() => remove(toast.id)}
                aria-label="Dismiss"
              >
                Close
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export { toast } from './toast';

export function useToast() {
  return toast;
}
