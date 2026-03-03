'use client';

import { useRouter } from 'next/navigation';
import { employees } from '@/lib/mock-employees';

export default function EmployeeList() {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {employees.map((emp) => (
        <div
          key={emp.id}
          onClick={() => router.push(`/admin/chat/${emp.id}`)}
          className="flex cursor-pointer items-center justify-between rounded border bg-white p-3 hover:bg-gray-50"
        >
          <div>
            <p className="font-medium">{emp.name}</p>
            <p className="text-xs text-gray-500">
              {emp.email} | {emp.role}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Pending: {emp.pending}</span>
            <span className="text-gray-600">Completed: {emp.completed}</span>
            <span
              className={`rounded px-2 py-1 text-xs ${
                emp.status === 'Active'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-yellow-100 text-yellow-600'
              }`}
            >
              {emp.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
