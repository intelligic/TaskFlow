"use client";

import { useEffect, useState } from "react";
import ChatBox from "@/components/chat/ChatBox";
import { getProfile } from "@/lib/api/authApi";

export default function EmployeeChatPage() {
  const [conversationKey, setConversationKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;
        const id = profile?._id || "";
        setConversationKey(id ? `employee-${id}` : null);
      } catch {
        if (cancelled) return;
        setConversationKey(null);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!conversationKey) {
    return <div className="space-y-4" />;
  }

  return (
    <div className="space-y-4">
      <ChatBox key={conversationKey} role="employee" conversationKey={conversationKey} />
    </div>
  );
}
