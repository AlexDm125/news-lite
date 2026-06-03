"use client";

import { useState } from "react";
import { deleteNewsAction } from "@/app/actions/news";
import ConfirmDialog from "./ConfirmDialog";

interface DeleteNewsButtonProps {
  id: string;
}

export default function DeleteNewsButton({ id }: DeleteNewsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteNewsAction(id);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("Сталася помилка при видаленні новини.");
      setIsLoading(false);
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

      <ConfirmDialog
        isOpen={isOpen}
        title="Видалити новину?"
        message="Ця дія необоротна. Новина буде видалена назавжди."
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
}
