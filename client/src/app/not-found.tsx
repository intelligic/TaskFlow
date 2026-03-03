import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-600">The page you requested does not exist.</p>
      <Link href="/" className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90">
        Go to home
      </Link>
    </div>
  );
}
