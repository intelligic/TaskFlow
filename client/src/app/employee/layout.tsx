'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmployeeNavbar from '@/components/layout/EmployeeNavbar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="employee">
      <div className="min-h-screen bg-gray-200">
        <EmployeeNavbar />
        <main className="p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}