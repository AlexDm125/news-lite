"use client";

import { useState } from "react";
import { deleteUserCommentAction } from "@/app/actions/news";
import ConfirmDialog from "./ConfirmDialog";
import ErrorDialog from "./ErrorDialog";

interface DeleteProfileCommentButtonProps {
  commentId: string;
}

export default function DeleteProfileCommentButton({
  commentId,
}: DeleteProfileCommentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteUserCommentAction(commentId);
    
    if (result.error) {
      setError(result.error);
      setShowConfirm(false);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      window.location.reload();
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
        isOpen={showConfirm}
        title="Видалити коментар?"
        message="Ця дія необоротна. Коментар буде видалено навічно."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={isLoading}
      />

      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
      >
        {isLoading ? "Видаляю..." : "Видалити"}
      </button>
    </>
  );
}
