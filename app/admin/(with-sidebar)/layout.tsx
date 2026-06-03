import AdminSidebar from "@/components/AdminSidebar";
import type { ReactNode } from "react";

export default function WithSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <AdminSidebar />
      <div className="flex-1 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
}