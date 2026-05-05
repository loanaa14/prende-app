"use client";

import Link from "next/link";

export default function InternalHeader({ userEmail }: { userEmail: string }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-lg font-extrabold tracking-tight">
          Prendé
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-gray-500 sm:inline">{userEmail}</span>

          <form action="/logout" method="post">
            <button className="text-sm font-semibold text-red-600">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}