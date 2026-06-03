import Link from "next/link";
import type { ReactNode } from "react";

type HeaderProps = {
  title: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  homeLink?: string;
};

export default function Header({ title, leftContent, rightContent, homeLink = "/" }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Ліва частина: Заголовок та опціональні категорії */}
        <div className="flex items-center space-x-8">
          <Link href={homeLink} className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          </Link>
          
          {leftContent && (
            <div className="hidden md:block">
              {leftContent}
            </div>
          )}
        </div>

        {/* Права частина: Кнопки логіну або профіль */}
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </nav>
    </header>
  );
}
