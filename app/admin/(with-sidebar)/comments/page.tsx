import prisma from "@/lib/prisma";
import CommentModerationAction from "@/components/CommentModerationAction";
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorClass(index: number) {
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-red-600",
    "bg-purple-600",
    "bg-yellow-600",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-cyan-600",
  ];
  return colors[index % colors.length];
}

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "pending";
  const searchQuery = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 3;
  const skip = (page - 1) * itemsPerPage;

  const where: any = {};

  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter.toUpperCase();
  }

  if (searchQuery) {
    where.news = {
      title: { contains: searchQuery, mode: "insensitive" },
    };
  }

  const [comments, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        user: true,
        news: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: itemsPerPage,
    }),
    prisma.comment.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = skip + 1;
  const endItem = Math.min(skip + itemsPerPage, totalCount);

  const timeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${days === 1 ? "день" : "днів"} тому`;
    if (hours > 0) return `${hours} ${hours === 1 ? "година" : "годин"} тому`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? "хвилина" : "хвилин"} тому`;
    return "щойно";
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Модерація коментарів</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form className="flex gap-4">
          <select 
            name="status"
            defaultValue={statusFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Всі статуси</option>
            <option value="active">Активні</option>
            <option value="pending">На модерації</option>
            <option value="hidden">Приховані</option>
          </select>
          <input 
            type="text" 
            name="search"
            defaultValue={searchQuery}
            placeholder="Пошук за назвою новини..." 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Пошук
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className={`bg-white rounded-lg shadow-md p-6 ${
              comment.status === "PENDING"
                ? "border-2 border-orange-400"
                : comment.status === "HIDDEN"
                  ? "opacity-60"
                  : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 ${getColorClass(index)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {getInitials(comment.user.name)}
                </div>
                <div>
                  <Link
                    href={`/admin/user-detail?id=${comment.user.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {comment.user.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    до новини: "{comment.news.title}"
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
                  comment.status === "ACTIVE"
                    ? "text-green-600 bg-green-50"
                    : comment.status === "PENDING"
                      ? "text-orange-600 bg-orange-50"
                      : "text-red-600 bg-red-50"
                }`}
              >
                {comment.status === "ACTIVE"
                  ? "Активний"
                  : comment.status === "PENDING"
                    ? "На модерації"
                    : "Прихований"}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{comment.content}</p>

            <div className="flex space-x-2">
              <CommentModerationAction
                commentId={comment.id}
                currentStatus={comment.status}
              />
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            <p>Коментарів за вибраними критеріями не знайдено</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-700">Показано <span className="font-medium">{startItem}</span> до <span className="font-medium">{endItem}</span> з <span className="font-medium">{totalCount}</span> результатів</p>
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`?status=${statusFilter}&search=${searchQuery}&page=${page - 1}`}
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
                href={`?status=${statusFilter}&search=${searchQuery}&page=${p}`}
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
                href={`?status=${statusFilter}&search=${searchQuery}&page=${page + 1}`}
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
