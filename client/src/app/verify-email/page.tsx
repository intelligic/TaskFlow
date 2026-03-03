import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 text-center">
        <h1 className="text-xl font-semibold">Verify Your Email</h1>
        <p className="mt-2 text-sm text-gray-600">
          Verification flow is not configured yet.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
