import Link from "next/link";

export function AuthButtons() {
  return (
    <div className="flex items-center space-x-4">
      <Link href="/login" className="text-gray-600 hover:text-gray-900">
        Увійти
      </Link>
      <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Реєстрація
      </Link>
    </div>
  );
}
