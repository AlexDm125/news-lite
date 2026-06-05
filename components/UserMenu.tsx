"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
        {session.user.name || session.user.email}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-gray-600 hover:text-gray-900 text-sm bg-transparent border-none p-0 cursor-pointer"
      >
        Вийти
      </button>
    </div>
  );
}
