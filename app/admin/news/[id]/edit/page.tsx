import prisma from "@/lib/prisma";
import NewsForm from "@/components/NewsForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [news, categories] = await Promise.all([
    prisma.news.findUnique({ where: { id }, include: { author: true } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!news) notFound();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Редагування новини</h2>
        <Link href="/admin/news" className="text-blue-600 hover:text-blue-700">← Повернутися до списку</Link>
      </div>
      <NewsForm categories={categories} initialData={news} />
    </div>
  );
}