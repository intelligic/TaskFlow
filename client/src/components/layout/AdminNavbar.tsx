'use client';

import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/admin/dashboard" className="font-semibold">
          Task Manager
        </Link>

        <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-black">
          Dashboard
        </Link>
        <Link href="/admin/employees" className="text-sm text-gray-600 hover:text-black">
          Employees
        </Link>
        <Link href="/admin/archive" className="text-sm text-gray-600 hover:text-black">
          Archive
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/employees/invite"
          className="border px-3 py-1.5 rounded text-sm hover:bg-gray-100"
        >
          + Add Employee
        </Link>

        <Link
          href="/admin/task/create"
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          + Create Task
        </Link>

        <div
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600"
          aria-label="User profile"
          title="User"
        >
          <User size={16} />
        </div>

        <button
          onClick={handleLogout}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-black"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
