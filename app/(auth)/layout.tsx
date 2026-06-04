import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="News Lite" />
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
