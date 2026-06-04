"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col flex-1">
        {children}
      </div>
    </SessionProvider>
  );
}
