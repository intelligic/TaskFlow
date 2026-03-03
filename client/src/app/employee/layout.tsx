'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmployeeNavbar from '@/components/layout/EmployeeNavbar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="employee">
      <div className="min-h-screen bg-gray-50">
        <EmployeeNavbar />
        <main className="p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}