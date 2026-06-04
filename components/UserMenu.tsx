"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/app/actions/auth";

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
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-gray-600 hover:text-gray-900 text-sm bg-transparent border-none p-0 cursor-pointer"
        >
          Вийти
        </button>
      </form>
    </div>
  );
}
