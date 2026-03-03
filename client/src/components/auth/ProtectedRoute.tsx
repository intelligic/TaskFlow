// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function ProtectedRoute({
//   children,
//   role,
// }: {
//   children: React.ReactNode;
//   role: 'admin' | 'employee';
// }) {
//   const router = useRouter();

//   useEffect(() => {
//     const userRole = localStorage.getItem('role');

//     if (!userRole) {
//       router.push('/login');
//       return;
//     }

//     if (userRole !== role) {
//       router.push(`/${userRole}/dashboard`);
//     }
//   }, [router, role]);

//   return <>{children}</>;
// }

'use client';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔓 TEMP DEV MODE:
  // Frontend UI testing ke liye sabko allow
  return <>{children}</>;
}