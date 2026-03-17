"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  type NotificationItem,
} from "@/lib/api/notificationApi";

const formatWhen = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items],
  );

  const refresh = async (options?: { silent?: boolean }) => {
    try {
      setError(false);
      if (!options?.silent) setLoading(true);
      const res = await getNotifications();
      setItems(Array.isArray(res) ? res : []);
    } catch {
      setError(true);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh({ silent: true });
      }
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh({ silent: true });
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={async () => {
          const next = !open;
          setOpen(next);
          if (next) await refresh();
        }}
        className="relative rounded p-2 text-slate-700 hover:bg-slate-100"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await markAllNotificationsRead();
                    await refresh();
                  } catch {
                    // silent
                  }
                }}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Mark All Read
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await clearNotifications();
                    setItems([]);
                  } catch {
                    // silent
                  }
                }}
                className="text-[10px] font-bold text-red-600 hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="px-3 py-3 text-sm font-semibold text-slate-600">Loading...</div>
          ) : error ? (
            <div className="px-3 py-3 text-sm font-semibold text-red-600">Failed to load</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-3 text-sm font-semibold text-slate-600">No new notifications</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={async () => {
                    if (n.isRead) return;
                    try {
                      await markNotificationRead(n._id);
                      setItems((prev) =>
                        prev.map((p) => (p._id === n._id ? { ...p, isRead: true } : p)),
                      );
                    } catch {
                      // keep silent
                    }
                  }}
                  className={`w-full border-b px-3 py-2 text-left last:border-b-0 ${
                    n.isRead ? "bg-white" : "bg-blue-50"
                  } hover:bg-slate-50`}
                >
                  <p className="text-[13px] font-semibold text-slate-900">{n.message}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                    {formatWhen(n.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
