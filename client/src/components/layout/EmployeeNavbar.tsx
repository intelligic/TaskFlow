'use client';

import { ClipboardList} from 'lucide-react';
import { RiLogoutCircleRLine } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EmployeeNavbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `text-[16px] font-semibold tracking-wide transition-colors ${
      pathname === path
        ? 'text-indigo-700'
        : 'text-slate-500 hover:text-indigo-600'
    }`;

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="flex items-center gap-2 text-xl text-black font-bold tracking-wider">
        <ClipboardList size={30} className='text-black' />
        <span>TaskManager</span>
      </h1>

      <nav className="flex items-center gap-4">
        <Link href="/employee/dashboard" className={linkClass('/employee/dashboard')}>
          Dashboard
        </Link>
        <Link href="/employee/archive" className={linkClass('/employee/archive')}>
          Archive
        </Link>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-600"
          aria-label="User profile"
          title="User"
        >
          <FaUserAlt size={18} />
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="rounded text-red-800 hover:text-red-400 font-bold"
          aria-label="Logout"
          title="Logout"
        >
          <RiLogoutCircleRLine size={22} />
        </button>
      </nav>
    </header>
  );
}
