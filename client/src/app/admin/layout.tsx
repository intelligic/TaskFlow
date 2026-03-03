'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminNavbar from '@/components/layout/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <main className="p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}