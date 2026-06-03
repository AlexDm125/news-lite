"use client";

import { useSession } from "next-auth/react";
import { AuthButtons } from "./AuthButtons";
import { UserMenu } from "./UserMenu";

export function HeaderButtons() {
  const { status } = useSession();

  if (status === "loading") {
    return <div className="text-gray-600">Завантаження...</div>;
  }

  if (status === "authenticated") {
    return <UserMenu />;
  }

  return <AuthButtons />;
}
