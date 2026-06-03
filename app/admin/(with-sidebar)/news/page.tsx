import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteNewsButton from "@/components/DeleteNewsButton";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const categoryFilter = params.category || "";
  const searchQuery = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 3;
  const skip = (page - 1) * itemsPerPage;

  const where: any = {};

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter === "published" ? "PUBLISHED" : "DRAFT";
  }

  if (categoryFilter && categoryFilter !== "all") {
    where.categoryId = categoryFilter;
  }

  if (searchQuery) {
    where.title = { contains: searchQuery, mode: "insensitive" };
  }

  const [newsList, totalCount, categories] = await Promise.all([
    prisma.news.findMany({
      where,
      include: { category: true, author: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: itemsPerPage,
    }),
    prisma.news.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = skip + 1;
  const endItem = Math.min(skip + itemsPerPage, totalCount);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Управління новинами</h2>
        <Link href="/admin/news/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
          + Створити новину
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <select 
              name="status"
              defaultValue={statusFilter || "all"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі статуси</option>
              <option value="published">Опубліковано</option>
              <option value="draft">Чернетка</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Категорія</label>
            <select 
              name="category"
              defaultValue={categoryFilter || "all"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всі категорії</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пошук</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="search"
                defaultValue={searchQuery}
                placeholder="Пошук новини..." 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Пошук
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заголовок</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категорія</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {newsList.map((news) => (
              <tr key={news.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{news.title}</p>
                    <p className="text-sm text-gray-500">Автор: {news.author?.name || news.author?.email || "Невідомо"}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{news.category.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {news.status === "PUBLISHED" ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Опубліковано</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full">Чернетка</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(news.createdAt).toLocaleDateString("uk-UA")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link href={`/admin/news/${news.id}/edit`} className="text-blue-600 hover:text-blue-900">Редагувати</Link>
                  <DeleteNewsButton id={news.id} />
                </td>
              </tr>
            ))}
            {newsList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Новин ще немає. Створіть першу!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-700">Показано <span className="font-medium">{startItem}</span> до <span className="font-medium">{endItem}</span> з <span className="font-medium">{totalCount}</span> результатів</p>
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`?status=${statusFilter}&category=${categoryFilter}&search=${searchQuery}&page=${page - 1}`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Попередня
              </Link>
            )}
            {page <= 1 && (
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 opacity-50 cursor-not-allowed" disabled>Попередня</button>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`?status=${statusFilter}&category=${categoryFilter}&search=${searchQuery}&page=${p}`}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </Link>
            ))}

            {page < totalPages && (
              <Link
                href={`?status=${statusFilter}&category=${categoryFilter}&search=${searchQuery}&page=${page + 1}`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Наступна
              </Link>
            )}
            {page >= totalPages && (
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 opacity-50 cursor-not-allowed" disabled>Наступна</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
