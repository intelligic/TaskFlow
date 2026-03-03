'use client';

import ChatBox from '@/components/chat/ChatBox';

export default function EmployeeChatPage() {
  return (
    <div className="space-y-4">
      <ChatBox role="employee" />
    </div>
  );
}