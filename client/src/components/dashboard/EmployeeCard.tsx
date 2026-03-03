'use client';

import { useRouter } from 'next/navigation';

type Props = {
  employee: {
    id: string;
    name: string;
    pending: number;
    completed: number;
  };
};

export default function EmployeeCard({ employee }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/admin/chat/${employee.id}`)}
      className="cursor-pointer rounded-lg border bg-white p-4 transition hover:shadow-sm"
    >
      <p className="font-medium">{employee.name}</p>

      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">Pending: {employee.pending}</span>
        <span className="flex items-center gap-1">Completed: {employee.completed}</span>
      </div>
    </div>
  );
}
