import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { HeaderButtons } from "../../components/HeaderButtons";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        title="News Lite" 
        rightContent={<HeaderButtons />}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
