export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  message: string;
  type: ToastType;
  durationMs?: number;
};

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();

const emit = (payload: ToastPayload) => {
  listeners.forEach((listener) => listener(payload));
};

export const toast = {
  notify: (message: string, type: ToastType = 'info', durationMs?: number) => {
    const trimmed = message?.trim();
    if (!trimmed) return;
    emit({ message: trimmed, type, durationMs });
  },
  success: (message: string, durationMs?: number) => emit({ message, type: 'success', durationMs }),
  error: (message: string, durationMs?: number) => emit({ message, type: 'error', durationMs }),
  info: (message: string, durationMs?: number) => emit({ message, type: 'info', durationMs }),
};

export const subscribeToToasts = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
