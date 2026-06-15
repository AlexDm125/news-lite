"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const remember = formData.get("remember") === "on";

    try {
      const result = await signIn("credentials", {
        email,
        password,
        remember: remember ? "true" : "false",
        redirect: false,
      });

      if (!result?.ok || result?.error) {
        setErrors({ email: ["Email або пароль невірні"] });
        setIsLoading(false);
        return;
      }

      // Перевіримо роль користувача після логіну
      setTimeout(async () => {
        const response = await fetch("/api/auth/session");
        const sessionData = await response.json();
        
        if (sessionData?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }, 100);
    } catch (error) {
      setErrors({ email: ["Помилка при логіні"] });
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
            Запам'ятати мене
          </label>
        </div>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
      >
        {isLoading ? "Вхід..." : "Увійти"}
      </button>

      <div className="text-center">
        <p className="text-gray-600">
          Немає облікового запису?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Зареєструватися
          </Link>
        </p>
      </div>
    </form>
  );
}
