'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminNavbar from '@/components/layout/AdminNavbar';
import Footer from '@/components/layout/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto px-14 pt-10">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
