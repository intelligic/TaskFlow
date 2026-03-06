'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmployeeNavbar from '@/components/layout/EmployeeNavbar';
import Footer from '@/components/layout/Footer';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="employee">
      <div className="flex h-dvh flex-col overflow-hidden bg-white">
        <EmployeeNavbar />
        <main className="flex-1 min-h-0 overflow-hidden px-14 pt-10 pb-3">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
