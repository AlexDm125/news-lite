"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    const headersList = document.location.origin;
    await signOut({ redirectTo: headersList });
  };

  return (
    <div className="flex items-center space-x-4">
      <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
        {session.user.name || session.user.email}
      </Link>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-gray-900 text-sm bg-transparent border-none p-0 cursor-pointer"
      >
        Вийти
      </button>
    </div>
  );
}
