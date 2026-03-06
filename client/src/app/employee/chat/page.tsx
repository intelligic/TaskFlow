'use client';

import { useEffect, useState } from 'react';
import ChatBox from '@/components/chat/ChatBox';
import { employees } from '@/lib/mock-employees';

export default function EmployeeChatPage() {
  const [conversationKey, setConversationKey] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('employeeId');
    if (storedId) return setConversationKey(`employee-${storedId}`);

    const storedEmail = localStorage.getItem('email') || localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('employeeName');
    const matched =
      employees.find((emp) => storedEmail && emp.email.toLowerCase() === storedEmail.toLowerCase()) ||
      employees.find((emp) => storedName && emp.name.toLowerCase() === storedName.toLowerCase());

    if (matched) return setConversationKey(`employee-${matched.id}`);

    setConversationKey('employee-1');
  }, []);

  if (!conversationKey) {
    return <div className="space-y-4" />;
  }

  return (
    <div className="space-y-4">
      <ChatBox role="employee" conversationKey={conversationKey} />
    </div>
  );
}
