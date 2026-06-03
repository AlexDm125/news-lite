"use client";

import { useState, FormEvent } from "react";
import { addCommentAction } from "@/app/actions/news";

interface CommentFormProps {
  newsId: string;
  newsSlug: string;
}

export default function CommentForm({ newsId, newsSlug }: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!content.trim()) {
        throw new Error("Напишіть коментар");
      }

      if (content.length > 1000) {
        throw new Error("Коментар не повинен перевищувати 1000 символів");
      }

      const result = await addCommentAction(newsId, content);

      if (result.success) {
        setSuccess(true);
        setContent("");
        setTimeout(() => {
          const commentsSection = document.querySelector("[data-comments-section]");
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка при додаванні коментаря");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ Коментар додано! Він буде видимий після модерації адміністратором.
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSuccess(false);
          }}
          placeholder="Напишіть ваш коментар..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-2">
          {content.length}/1000 символів
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 transition"
      >
        {isLoading ? "Надсилання..." : "Надіслати коментар"}
      </button>

      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        💬 Коментар буде видний іншим користувачам після перевірки адміністратором.
      </p>
    </form>
  );
}
