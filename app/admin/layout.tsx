import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import AdminLogoutButton from "../../components/AdminLogoutButton";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "Адміністратор";
  const userId = (session?.user as any)?.id;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header
        title="Адміністративна панель"
        homeLink="/admin/dashboard"
        rightContent={
          <div className="flex items-center space-x-4">
            {userId ? (
              <a href={`/profile`} className="text-gray-700 font-medium text-sm hover:text-blue-600 cursor-pointer">
                {userName}
              </a>
            ) : (
              <span className="text-gray-700 font-medium text-sm">{userName}</span>
            )}
            <AdminLogoutButton />
          </div>
        }
      />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
