'use client';

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

        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-black ml-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}