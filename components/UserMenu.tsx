"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirectTo: "/" });
  };

  return (
    <div className="flex items-center space-x-4">
      <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
        {session.user.name || session.user.email}
      </Link>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-gray-600 hover:text-gray-900 text-sm disabled:opacity-50"
      >
        {isLoggingOut ? "Вихід..." : "Вийти"}
      </button>
    </div>
  );
}
