"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityItem } from "@/lib/api/activityApi";
import { getActivities } from "@/lib/api/activityApi";

const formatWhen = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const getUserName = (activity: ActivityItem) =>
  activity.user?.name || activity.performedBy?.name || "Unknown user";

const getEntityLabel = (activity: ActivityItem) => {
  const raw = activity.entity || activity.targetType || "";
  const normalized = raw.toString().toLowerCase();
  if (!normalized) return "";
  return normalized;
};

const getEntityName = (activity: ActivityItem) => {
  if (activity.entityName) return activity.entityName;
  if (activity.description) return activity.description;
  return "";
};

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await getActivities();
        if (cancelled) return;
        setActivities(Array.isArray(res) ? res : []);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [activities]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 items-start justify-start">
        <h2 className="text-lg font-bold text-black tracking-wide font-serif">Activity</h2>
        <p className="text-[12px] font-semibold text-gray-500 tracking-wider">
          System-wide activity timeline.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-red-600">
          Failed to load activity
        </p>
      )}

      {loading && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-600">
          Loading...
        </p>
      )}

      {!loading && !error && sortedActivities.length === 0 && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-600">
          No activity recorded yet
        </p>
      )}

      {!loading && !error && sortedActivities.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-3 border-b border-b-gray-100 text-[14px] opacity-80 bg-gray-100 text-black text-center tracking-wide font-semibold">
            <span className="col-span-3 text-left">User</span>
            <span className="col-span-6 text-left">Activity</span>
            <span className="col-span-3 text-right">Time</span>
          </div>

          {sortedActivities.map((activity) => {
            const userName = getUserName(activity);
            const action = activity.action || "updated";
            const entity = getEntityLabel(activity);
            const entityName = getEntityName(activity);
            const when = formatWhen(activity.createdAt);

            const message = `${userName} ${action}${
              entity ? ` ${entity}` : ""
            }${entityName ? ` "${entityName}"` : ""}`;

            return (
              <div
                key={activity._id || `${userName}-${activity.createdAt}-${message}`}
                className="grid grid-cols-12 px-4 py-3 border-b border-b-gray-100 last:border-b-0 text-[12px] font-semibold text-black"
              >
                <span className="col-span-3 text-left text-[14px] font-bold font-serif">
                  {userName}
                </span>
                <span className="col-span-6 text-left opacity-80">{message}</span>
                <span className="col-span-3 text-right opacity-70">{when}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
