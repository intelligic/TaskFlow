'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmployeeNavbar from '@/components/layout/EmployeeNavbar';
import Footer from '@/components/layout/Footer';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="employee">
      <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
        <EmployeeNavbar />
        <main className="flex-1 min-h-0 overflow-hidden px-10 pt-8">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
