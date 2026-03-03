'use client';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'admin' | 'employee';
}) {
  // TEMP DEV MODE: allow all roles during UI development.
  void role;
  return <>{children}</>;
}
