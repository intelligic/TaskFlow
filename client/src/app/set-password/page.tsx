import { Suspense } from "react";

import SetPasswordClient from "./set-password-client";

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
            <p className="text-sm font-semibold text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SetPasswordClient />
    </Suspense>
  );
}

