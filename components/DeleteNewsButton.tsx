"use client";

import { useState } from "react";
import { deleteNewsAction } from "@/app/actions/news";
import ConfirmDialog from "./ConfirmDialog";
import ErrorDialog from "./ErrorDialog";

interface DeleteNewsButtonProps {
  id: string;
}

export default function DeleteNewsButton({ id }: DeleteNewsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteNewsAction(id);
    if (result.error) {
      setError(result.error);
      setIsOpen(false);
      setIsLoading(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-600 hover:text-red-900 cursor-pointer bg-transparent border-none p-0"
      >
        Видалити
      </button>

      <ErrorDialog
        isOpen={!!error}
        title="Помилка"
        message={error || ""}
        onClose={() => setError(null)}
      />

      <ConfirmDialog
        isOpen={isOpen}
        title="Видалити новину?"
        message="Ця дія незворотна. Новина буде видалена назавжди."
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
}
