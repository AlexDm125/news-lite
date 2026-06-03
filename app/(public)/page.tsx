import prisma from "@/lib/prisma";
import Link from "next/link";
import { NewsFilters } from "@/components/NewsFilters";

const ITEMS_PER_PAGE = 3;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const categoryFilter = params.category || "";
  const sortOrder = params.sort || "desc";
  const currentPage = parseInt(params.page || "1", 10);

  // Побудова умови запиту
  const where = {
    status: "PUBLISHED" as const,
    ...(searchQuery && {
      title: { contains: searchQuery, mode: "insensitive" as const },
    }),
    ...(categoryFilter && { categoryId: categoryFilter }),
  };

  // Отримуємо загальну кількість новин
  const totalCount = await prisma.news.count({ where });
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const news = await prisma.news.findMany({
    where,
    include: { category: true, author: true },
    orderBy: { publishedAt: sortOrder === "asc" ? "asc" : "desc" },
    skip,
    take: ITEMS_PER_PAGE,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Генрування URL параметрів для пагінації
  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (categoryFilter) params.set("category", categoryFilter);
    if (sortOrder !== "desc") params.set("sort", sortOrder);
    if (pageNum > 1) params.set("page", String(pageNum));

    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  const startItem = skip + 1;
  const endItem = Math.min(skip + ITEMS_PER_PAGE, totalCount);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NewsFilters
        categories={categories}
        currentSearch={searchQuery}
        currentCategory={categoryFilter}
        currentSort={sortOrder}
        currentPage={currentPage}
      />

      {/* News Grid */}
      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {news.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {article.coverImage && (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-blue-600 font-medium uppercase">
                    {article.category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("uk-UA")
                      : ""}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                  <Link href={`/article/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {(() => {
                    const firstPara = (article.content as any)?.blocks?.find((b: any) => b.type === 'paragraph');
                    return firstPara?.data?.text?.substring(0, 150) + '...' || 'Цікава стаття для вас...';
                  })()}
                </p>
                <Link href={`/article/${article.slug}`} className="text-blue-600 font-medium hover:text-blue-700">
                  Читати далі →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">Новин не знайдено</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm text-gray-700">Показано <span className="font-medium">{startItem}</span> до <span className="font-medium">{endItem}</span> з <span className="font-medium">{totalCount}</span> результатів</p>
          <div className="flex justify-center items-center space-x-2">
            {currentPage > 1 && (
              <Link
                href={buildUrl(currentPage - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                ← Попередня
              </Link>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (pageNum > totalPages) return null;
              return (
                <Link
                  key={pageNum}
                  href={buildUrl(pageNum)}
                  className={`px-4 py-2 rounded-lg ${
                    pageNum === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {currentPage < totalPages && (
              <Link
                href={buildUrl(currentPage + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Наступна →
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
