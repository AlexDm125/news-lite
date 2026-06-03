import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalNews, newsThisMonth, totalUsers, usersThisMonth, totalComments, commentsThisMonth, pendingComments] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
  ]);

  // Отримуємо останні 3 видимі дії
  const recentNews = await prisma.news.findMany({
    take: 1,
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  const recentUsers = await prisma.user.findMany({
    take: 1,
    orderBy: { createdAt: "desc" },
  });

  const recentComments = await prisma.comment.findMany({
    take: 1,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Статистика</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Всього новин</h3>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalNews}</p>
          <p className="text-sm text-green-600 mt-2">+{newsThisMonth} цього місяця</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Користувачі</h3>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-sm text-green-600 mt-2">+{usersThisMonth} цього місяця</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Коментарі</h3>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalComments}</p>
          <p className="text-sm text-green-600 mt-2">+{commentsThisMonth} цього місяця</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">На модерації</h3>
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingComments}</p>
          <p className="text-sm text-orange-600 mt-2">Потребує уваги</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Остання активність</h3>
        <div className="space-y-4">
          {recentNews.length > 0 && (
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  Додано нову новину: "{recentNews[0].title}"
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(recentNews[0].createdAt).toLocaleDateString("uk-UA")}
                </p>
              </div>
            </div>
          )}

          {recentUsers.length > 0 && (
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  Новий користувач зареєструвався: {recentUsers[0].name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(recentUsers[0].createdAt).toLocaleDateString("uk-UA")}
                </p>
              </div>
            </div>
          )}

          {recentComments.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  Новий коментар від користувача
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(recentComments[0].createdAt).toLocaleDateString("uk-UA")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
