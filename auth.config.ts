import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 години за замовчуванням
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // Зберігаємо інформацію про remember me
        token.rememberMe = (user as any).rememberMe === "true";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).rememberMe = token.rememberMe;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Дозволити редиректи тільки на той же домен
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig;