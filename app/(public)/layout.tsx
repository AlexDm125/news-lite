import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { HeaderButtons } from "../../components/HeaderButtons";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="News Lite" 
        rightContent={<HeaderButtons />}
      />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
