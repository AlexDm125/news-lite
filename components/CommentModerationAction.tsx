"use client";

import { useState } from "react";
import { updateCommentStatusAction, deleteCommentAction } from "@/app/actions/auth";
import ConfirmDialog from "./ConfirmDialog";
import ErrorDialog from "./ErrorDialog";

interface CommentModerationActionProps {
  commentId: string;
  currentStatus: string;
}

export default function CommentModerationAction({
  commentId,
  currentStatus,
}: CommentModerationActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleStatusChange = async (newStatus: "ACTIVE" | "HIDDEN" | "PENDING") => {
    if (isLoading) return;
    
    setIsLoading(true);
    const result = await updateCommentStatusAction(commentId, newStatus);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteCommentAction(commentId);
    if (result.error) {
      setError(result.error);
      setDeleteConfirm(false);
      setIsLoading(false);
    } else {
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
        isOpen={deleteConfirm}
        title="Видалити коментар?"
        message="Ця дія необоротна. Коментар буде видалено навічно."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
        isLoading={isLoading}
      />

      {currentStatus === "ACTIVE" && (
        <>
          <button
            onClick={() => handleStatusChange("HIDDEN")}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
          >
            Приховати
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            Видалити
          </button>
        </>
      )}
      {currentStatus === "PENDING" && (
        <>
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
          >
            Схвалити
          </button>
          <button
            onClick={() => handleStatusChange("HIDDEN")}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
          >
            Відхилити
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            Видалити
          </button>
        </>
      )}
      {currentStatus === "HIDDEN" && (
        <>
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
          >
            Показати
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            Видалити
          </button>
        </>
      )}
    </>
  );
}
