import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Ініціалізуємо NextAuth суто з едж-конфігом (без Prisma!)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;
  
  const userRole = (req.auth?.user as { role?: string } | undefined)?.role;

  // 1. Користувач НЕ залогінений
  if (!isLoggedIn) {
    // Блокуємо приватні сторінки
    if (pathname.startsWith("/profile") || pathname.startsWith("/profile-edit") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // 2. Користувач ЗАЛОГІНЕНИЙ
  if (isLoggedIn) {
    // Якщо намагається зайти на логін/реєстрацію — перенаправляємо
    if (pathname === "/login" || pathname === "/register") {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Якщо лізе в адмінку, але не адмін
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/profile-edit/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};