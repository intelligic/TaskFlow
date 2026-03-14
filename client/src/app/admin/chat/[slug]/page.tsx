"use client";

import { useEffect, useMemo, useState } from "react";
import ChatBox from "@/components/chat/ChatBox";
import { getEmployeeBySlug } from "@/lib/api/employeeApi";

type Props = {
  params: { slug: string } | Promise<{ slug: string }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}



export default function AdminChatPage({ params }: Props) {
  const [slug, setSlug] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [employee, setEmployee] = useState<{
    name: string;
    designation?: string;
    lastActive?: string;
    isOnline?: boolean;
  }>({
    name: "Employee",
    designation: "",
    isOnline: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(params).then((resolved) => setSlug(resolved.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getEmployeeBySlug(slug);
        if (cancelled) return;
        setEmployee({
          name: res.name || "Employee",
          designation: res.designation || "",
          lastActive: res.lastActive,
          isOnline: res.isOnline,
        });
        setEmployeeId(res._id);
      } catch {
        if (cancelled) return;
        setEmployee({ name: `Employee ${slug}`, designation: "" });
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const conversationKey = useMemo(() => {
    if (!employeeId) return "";
    return `employee-${employeeId}`;
  }, [employeeId]);

  const online = employee.isOnline;

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-0 flex-col gap-6 overflow-hidden">
      <div className="flex items-center gap-3 rounded-lg bg-white">
        <div className="flex h-10 w-10 items-center  text-[22px] justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {getInitials(employee.name)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Chat with {employee.name}</h2>
          <p className="text-[12px] font-semibold tracking-wide text-gray-500">
            {employee.designation || "Employee"}
            <span className="mx-2">|</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                online
                  ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {online ? "Online" : "Offline"}
            </span>
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {!loading && conversationKey ? (
          <ChatBox conversationKey={conversationKey} role="admin" targetEmployeeId={employeeId} />
        ) : (
          <div className="text-sm font-semibold text-gray-600">Loading...</div>
        )}
      </div>
    </div>
  );
}
