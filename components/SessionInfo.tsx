"use client";

import { useSession } from "next-auth/react";

export function SessionInfo() {
  const { data: session, status } = useSession();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Статус сесії</h2>
      {status === "loading" && (
        <p className="text-gray-600">Завантаження...</p>
      )}
      {status === "unauthenticated" && (
        <p className="text-red-600 font-medium">❌ Ви не залогінені</p>
      )}
      {status === "authenticated" && session?.user && (
        <div>
          <p className="text-green-600 font-medium">✅ Залогінені</p>
          <p className="text-gray-700">Ім'я: <strong>{session.user.name}</strong></p>
          <p className="text-gray-700">Email: <strong>{session.user.email}</strong></p>
          {(session.user as any).role && (
            <p className="text-gray-700">Роль: <strong>{(session.user as any).role}</strong></p>
          )}
        </div>
      )}
    </div>
  );
}
