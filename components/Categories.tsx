import Link from "next/link";

export function Categories() {
  return (
    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-700">
      <Link href="/" className="hover:text-blue-600">
        Головна
      </Link>
      <Link href="/" className="hover:text-blue-600">
        Політика
      </Link>
      <Link href="/" className="hover:text-blue-600">
        Економіка
      </Link>
      <Link href="/" className="hover:text-blue-600">
        Технології
      </Link>
      <Link href="/" className="hover:text-blue-600">
        Спорт
      </Link>
    </div>
  );
}
