"use client";

import { useState } from "react";
import { blockUserAction, unblockUserAction } from "@/app/actions/auth";
import ErrorDialog from "./ErrorDialog";

interface UserActionButtonProps {
  userId: string;
  userStatus: string;
  onActionComplete?: () => void;
}

export default function UserActionButton({
  userId,
  userStatus,
  onActionComplete,
}: UserActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBlocked = userStatus === "BLOCKED";

  const handleAction = async () => {
    setIsLoading(true);
    const result = isBlocked
      ? await unblockUserAction(userId)
      : await blockUserAction(userId);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      if (onActionComplete) {
        onActionComplete();
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <>
      <ErrorDialog
        isOpen={!!error}
        title="Помилка"
        message={error || ""}
        onClose={() => setError(null)}
      />

      <button
        onClick={handleAction}
        disabled={isLoading}
        className={`cursor-pointer bg-transparent border-none p-0 disabled:opacity-50 transition ${
          isBlocked ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"
        }`}
      >
        {isLoading ? "..." : isBlocked ? "Розблокувати" : "Заблокувати"}
      </button>
    </>
  );
}
