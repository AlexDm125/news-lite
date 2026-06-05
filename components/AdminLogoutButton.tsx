"use client";

import { signOut } from "next-auth/react";

export default function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors cursor-pointer bg-transparent border-none p-0"
    >
      Вийти
    </button>
  );
}
