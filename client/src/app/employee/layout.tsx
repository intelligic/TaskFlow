'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EmployeeNavbar from '@/components/layout/EmployeeNavbar';
import Footer from '@/components/layout/Footer';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="employee">
      <div className="min-h-screen bg-white">
        <EmployeeNavbar />
        <main className="py-10 px-14">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
