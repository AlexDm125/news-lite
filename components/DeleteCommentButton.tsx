"use client";

import { useState } from "react";
import { deleteCommentAction } from "@/app/actions/auth";
import ConfirmDialog from "./ConfirmDialog";
import ErrorDialog from "./ErrorDialog";

interface DeleteCommentButtonProps {
  commentId: string;
  onActionComplete?: () => void;
}

export default function DeleteCommentButton({
  commentId,
  onActionComplete,
}: DeleteCommentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteCommentAction(commentId);

    if (result.error) {
      setError(result.error);
      setConfirm(false);
      setIsLoading(false);
    } else {
      setConfirm(false);
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

      <ConfirmDialog
        isOpen={confirm}
        title="Видалити коментар?"
        message="Ця дія необоротна. Коментар буде видалено назавжди."
        onConfirm={handleDelete}
        onCancel={() => setConfirm(false)}
        isLoading={isLoading}
      />

      <button
        onClick={() => setConfirm(true)}
        disabled={isLoading}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
      >
        {isLoading ? "Видаляю..." : "Видалити"}
      </button>
    </>
  );
}
