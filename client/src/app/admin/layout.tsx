'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminNavbar from '@/components/layout/AdminNavbar';
import Footer from '@/components/layout/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-white">
        <AdminNavbar />
        <main className="px-14 py-10">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
