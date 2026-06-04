"use client";

import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function RegisterForm() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (!result.success) {
      setErrors(result.errors || {});
      setIsLoading(false);
      return;
    }

    // Оновити сесію після реєстрації
    await updateSession();

    setTimeout(() => {
      router.refresh();
      router.push("/");
    }, 100);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Ім'я
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ваше повне ім'я"
          required
          disabled={isLoading}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@example.com"
          required
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Пароль
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
          Підтвердження паролю
        </label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
        {errors.passwordConfirm && (
          <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm[0]}</p>
        )}
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          required
          disabled={isLoading}
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
          Я погоджуюся з умовами використання
        </label>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
      >
        {isLoading ? "Реєстрація..." : "Зареєструватися"}
      </button>

      <div className="text-center">
        <p className="text-gray-600">
          Вже маєте облік?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Увійти
          </Link>
        </p>
      </div>
    </form>
  );
}
