'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EmployeeNavbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `text-sm ${
      pathname === path ? 'text-blue-600 font-medium' : 'text-gray-600'
    } hover:text-black`;

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="font-semibold text-lg">TaskManager</h1>

      <nav className="flex items-center gap-6">
        <Link href="/employee/dashboard" className={linkClass('/employee/dashboard')}>
          Dashboard
        </Link>
        <Link href="/employee/archive" className={linkClass('/employee/archive')}>
          Archive
        </Link>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="text-sm text-gray-600 hover:text-black"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}