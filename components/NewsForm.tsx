"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { createNewsAction, updateNewsAction } from "@/app/actions/news";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Editor = dynamic(() => import("./Editor"), { ssr: false });

interface NewsFormProps {
  categories: { id: string; name: string }[];
  initialData?: any;
}

export default function NewsForm({ categories, initialData }: NewsFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [content, setContent] = useState(initialData?.content || { blocks: [] });
  const [isPending, setIsPending] = useState(false);

  // Визначаємо автора: або з існуючої статті, або з поточної сесії
  const authorName = initialData?.author?.name || session?.user?.name || session?.user?.email || "Адміністратор";

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    
    // Автоматично генеруємо URL (Slug)
    if (!initialData) {
      const translit = val.toLowerCase().replace(/[^a-z0-9а-яєіїґ ]/g, "").replace(/\s+/g, "-");
      setSlug(translit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug || "post-" + Date.now()); // Fallback якщо slug порожній
    formData.append("categoryId", categoryId);
    formData.append("status", status);
    formData.append("content", JSON.stringify(content));

    try {
      if (initialData?.id) {
        await updateNewsAction(initialData.id, formData);
      } else {
        await createNewsAction(formData);
      }
      router.push('/admin/news');
    } catch (err) {
      console.error(err);
      alert("Сталася помилка при збереженні.");
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <form onSubmit={handleSubmit}>
        {/* Заголовок */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        {/* Категорія та Статус */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Категорія</label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Оберіть категорію</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="PUBLISHED">Опубліковано</option>
              <option value="DRAFT">Чернетка</option>
            </select>
          </div>
        </div>

        {/* Editor.js Контент */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Контент</label>
          <div className="border border-gray-300 rounded-lg min-h-[400px] p-4 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
            <Editor onChange={setContent} initialData={initialData?.content} />
          </div>
        </div>

        {/* Cover Image Info */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-center">
              <svg className="w-5 h-5 inline mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Перше завантажене зображення автоматично стане обкладинкою новини
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Збереження..." : "Зберегти"}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/news')}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium inline-block cursor-pointer"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}
