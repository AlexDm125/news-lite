"use client";

import { useState } from "react";
import { updateCommentStatusAction, deleteCommentAction } from "@/app/actions/auth";

interface CommentModerationActionProps {
  commentId: string;
  currentStatus: string;
}

export default function CommentModerationAction({
  commentId,
  currentStatus,
}: CommentModerationActionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: "ACTIVE" | "HIDDEN" | "PENDING") => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await updateCommentStatusAction(commentId, newStatus);
      window.location.reload();
    } catch (error) {
      console.error("Error updating comment status:", error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Ви впевнені, що хочете видалити цей коментар?")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteCommentAction(commentId);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting comment:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
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
            onClick={handleDelete}
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
            onClick={handleDelete}
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
            onClick={handleDelete}
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
