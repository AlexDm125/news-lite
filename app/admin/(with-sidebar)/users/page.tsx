import prisma from "@/lib/prisma";
import Link from "next/link";
import UserActionButton from "@/components/UserActionButton";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (status && status !== "all") {
    where.status = status === "active" ? "ACTIVE" : "BLOCKED";
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        comments: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: itemsPerPage,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = skip + 1;
  const endItem = Math.min(skip + itemsPerPage, totalCount);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Управління користувачами</h2>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form className="flex gap-4">
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Пошук користувача..." 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            name="status"
            defaultValue={status || "all"}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Всі статуси</option>
            <option value="active">Активні</option>
            <option value="blocked">Заблоковані</option>
          </select>
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Пошук
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Користувач</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата реєстрації</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Коментарі</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${
                      user.role === "ADMIN" ? "bg-red-600" : "bg-blue-600"
                    }`}>
                      {user.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("uk-UA")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.comments.length}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.status === "ACTIVE" ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Активний</span>
                  ) : (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">Заблокований</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link href={`/admin/user-detail?id=${user.id}`} className="text-blue-600 hover:text-blue-900">Переглянути</Link>
                  <UserActionButton userId={user.id} userStatus={user.status} />
                </td>
              </tr>
            ))}
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
                href={`?search=${search}&status=${status}&page=${page - 1}`}
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
                href={`?search=${search}&status=${status}&page=${p}`}
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
                href={`?search=${search}&status=${status}&page=${page + 1}`}
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
