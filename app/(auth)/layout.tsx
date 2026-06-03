import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="News Lite" />
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">{children}</main>
      <Footer />
    </div>
  );
}
