import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import BlockUserButton from "@/components/BlockUserButton";
import DeleteCommentButton from "@/components/DeleteCommentButton";
import CommentModerationAction from "@/components/CommentModerationAction";

export default async function AdminUserDetailPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const params = await searchParams;
  const userId = params.id;

  if (!userId) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Користувач не знайдений</p>
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-700">
          ← Повернутися до списку
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { comments: { include: { news: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!user) {
    notFound();
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Повернутися до списку користувачів
        </Link>
        <h2 className="text-3xl font-bold text-gray-900">Профіль користувача</h2>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <div className="flex items-center space-x-4 mt-3">
                <div>
                  <span className="text-sm text-gray-500">Дата реєстрації:</span>
                  <span className="text-sm font-medium text-gray-900 ml-1">
                    {new Date(user.createdAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Коментарів:</span>
                  <span className="text-sm font-medium text-gray-900 ml-1">{user.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <span
              className={`inline-block text-xs font-medium px-4 py-2 rounded-full mb-4 ${
                user.status === "ACTIVE"
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              }`}
            >
              {user.status === "ACTIVE" ? "Активний" : "Заблокований"}
            </span>
            <div className="w-full">
              <BlockUserButton userId={user.id} userStatus={user.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Comments History */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Історія коментарів</h3>

        {user.comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Цей користувач ще не залишив коментарів</p>
        ) : (
          <div className="space-y-6">
            {user.comments.map((comment) => (
              <div key={comment.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
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
                      ? "Активний"
                      : comment.status === "PENDING"
                      ? "На модерації"
                      : "Приховано"}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{comment.content}</p>
                <div className="flex space-x-2">
                  <CommentModerationAction commentId={comment.id} currentStatus={comment.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
