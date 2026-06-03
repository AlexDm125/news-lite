import prisma from "@/lib/prisma";
import NewsForm from "@/components/NewsForm";
import Link from "next/link";

export default async function CreateNewsPage() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Створення новини</h2>
        <Link href="/admin/news" className="text-blue-600 hover:text-blue-700">← Повернутися до списку</Link>
      </div>
      <NewsForm categories={categories} />
    </div>
  );
}