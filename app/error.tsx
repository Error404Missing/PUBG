"use client";

import Link from "next/link";

export default function GlobalError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-4">ამ გვერდზე შეცდომა მოხდა</h1>
        <p className="text-gray-300 mb-4">მოგვყავს ინფორმაცია ლოგებში. თუ ეს შენია, შეამოწმე `VERCEL`/server logs და Env ვარიაბლები.</p>
        <pre className="text-xs bg-neutral-900 p-3 rounded mb-4 text-left overflow-auto">{String(error.message)}</pre>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-4 py-2 bg-yellow-600 rounded text-black">საწყისი</Link>
          <a href="/api/health" className="px-4 py-2 border border-neutral-700 rounded text-gray-300">Health</a>
        </div>
      </div>
    </div>
  );
}
