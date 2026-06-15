"use client";

import { useState } from "react";
import { blockUserAction, unblockUserAction } from "@/app/actions/auth";
import ErrorDialog from "./ErrorDialog";

interface BlockUserButtonProps {
  userId: string;
  userStatus: string;
  onActionComplete?: () => void;
}

export default function BlockUserButton({
  userId,
  userStatus,
  onActionComplete,
}: BlockUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setIsLoading(true);
    const result =
      userStatus === "BLOCKED"
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

  const isBlocked = userStatus === "BLOCKED";

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
        className={`block w-full px-6 py-3 rounded-lg hover:opacity-90 font-medium disabled:opacity-50 text-white transition ${
          isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isLoading ? "Обробка..." : isBlocked ? "Розблокувати користувача" : "Заблокувати користувача"}
      </button>
    </>
  );
}
