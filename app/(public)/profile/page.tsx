import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { deleteUserCommentAction } from "@/app/actions/news";

async function DeleteCommentButton({ commentId }: { commentId: string }) {
  return (
    <form action={async () => { "use server"; await deleteUserCommentAction(commentId); }}>
      <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
        Видалити
      </button>
    </form>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 3;
  const skip = (page - 1) * itemsPerPage;

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      comments: {
        include: { news: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalCount = user.comments.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedComments = user.comments.slice(skip, skip + itemsPerPage);
  const startItem = skip + 1;
  const endItem = Math.min(skip + itemsPerPage, totalCount);

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {initials}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Дата реєстрації:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Коментарів:</span>
                  <span className="font-medium text-gray-900">{user.comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      user.status === "ACTIVE"
                        ? "text-green-600 bg-green-50"
                        : "text-red-600 bg-red-50"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "Активний" : "Заблокований"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/profile-edit"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center"
              >
                Редагувати профіль
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md mb-6">
            {/* Comments List */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Мої коментарі</h3>

              {user.comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Ви ще не залишили коментарів
                </p>
              ) : (
                <div className="space-y-6">
                  {paginatedComments.map((comment, idx) => (
                    <div
                      key={comment.id}
                      className={`pb-6 ${
                        idx !== paginatedComments.length - 1 ? "border-b border-gray-200" : ""
                      }`}
                    >
                      <div className="mb-3">
                        <Link
                          href={`/article/${comment.news.slug}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {comment.news.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString("uk-UA")}
                        </p>
                      </div>
                      <p className="text-gray-700 mb-4">{comment.content}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            comment.status === "ACTIVE"
                              ? "text-green-600 bg-green-50"
                              : comment.status === "PENDING"
                              ? "text-orange-600 bg-orange-50"
                              : "text-gray-600 bg-gray-50"
                          }`}
                        >
                          {comment.status === "ACTIVE"
                            ? "Опубліковано"
                            : comment.status === "PENDING"
                            ? "На модерації"
                            : "Приховано"}
                        </span>
                        <DeleteCommentButton commentId={comment.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8">
                  <p className="text-sm text-gray-700">Показано <span className="font-medium">{startItem}</span> до <span className="font-medium">{endItem}</span> з <span className="font-medium">{totalCount}</span> результатів</p>
                  <div className="flex space-x-2">
                    {page > 1 && (
                      <Link
                        href={`?page=${page - 1}`}
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
                        href={`?page=${p}`}
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
                        href={`?page=${page + 1}`}
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
          </div>
        </div>
      </div>
    </main>
  );
}
