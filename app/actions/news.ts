"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "ADMIN") throw new Error("Неавторизований доступ");
  return session;
}

async function checkNotBlocked() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Неавторизований доступ");
  }
  
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { status: true }
  });
  
  if (user?.status === "BLOCKED") {
    throw new Error("Ваш обліковий запис заблокований. Вам заборонено виконувати операції зміни.");
  }
  
  return session;
}

export async function createNewsAction(formData: FormData) {
  const session = await checkAdmin();
  await checkNotBlocked();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as any;
  const excerpt = formData.get("excerpt") as string;
  const contentStr = formData.get("content") as string;
  const contentJson = JSON.parse(contentStr);
  
  const firstImageBlock = contentJson.blocks?.find((b: any) => b.type === "image");
  const coverImage = firstImageBlock ? firstImageBlock.data.file.url : null;

  await prisma.news.create({
    data: {
      title, slug, categoryId, status, content: contentJson, coverImage,
      authorId: (session.user as any).id,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/news");
  return { success: true };
}

export async function updateNewsAction(id: string, formData: FormData) {
  await checkAdmin();
  await checkNotBlocked();
  
  // Отримуємо поточні дані з БД
  const existingNews = await prisma.news.findUnique({ where: { id } });
  if (!existingNews) throw new Error("Новина не знайдена");
  
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as any;
  const contentStr = formData.get("content") as string;
  const contentJson = JSON.parse(contentStr);
  
  const firstImageBlock = contentJson.blocks?.find((b: any) => b.type === "image");
  const coverImage = firstImageBlock ? firstImageBlock.data.file.url : null;
  
  // Перевіряємо, чи щось змінилося
  const hasChanges = 
    title !== existingNews.title ||
    slug !== existingNews.slug ||
    categoryId !== existingNews.categoryId ||
    status !== existingNews.status ||
    JSON.stringify(contentJson) !== JSON.stringify(existingNews.content) ||
    coverImage !== (existingNews.coverImage || null);
  
  // Якщо нічого не змінилося, не оновлюємо БД
  if (!hasChanges) {
    return { success: true, message: "Немає змін" };
  }

  await prisma.news.update({
    where: { id },
    data: {
      title, slug, categoryId, status, content: contentJson, coverImage,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/news");
  return { success: true };
}

export async function deleteNewsAction(id: string) {
  await checkAdmin();
  await checkNotBlocked();
  await prisma.news.delete({ where: { id } });
  revalidatePath("/admin/news");
}

export async function addCommentAction(newsId: string, content: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Ви повинні бути авторизовані");
  }

  // Перевіряємо статус користувача - заблокований не може коментувати
  const user = await prisma.user.findUnique({ 
    where: { id: (session.user as any).id } 
  });
  
  if (!user) {
    throw new Error("Користувач не знайдений");
  }

  if (user.status === "BLOCKED") {
    throw new Error("Ваш обліковий запис заблокований. Ви не можете залишати коментарі.");
  }

  // Перевіряємо, що новина існує
  const news = await prisma.news.findUnique({ where: { id: newsId } });
  if (!news) {
    throw new Error("Новина не знайдена");
  }

  // Створюємо коментар зі статусом PENDING (на модерації)
  const comment = await prisma.comment.create({
    data: {
      content,
      status: "PENDING",
      userId: (session.user as any).id,
      newsId,
    },
    include: { user: true },
  });

  revalidatePath(`/article/${news.slug}`);
  return { success: true, comment };
}

export async function deleteUserCommentAction(commentId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Ви повинні бути авторизовані");
  }

  // Отримуємо коментар для перевірки власництва
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { news: true }
  });

  if (!comment) {
    throw new Error("Коментар не знайдений");
  }

  // Перевіряємо, що користувач - власник коментара
  if (comment.userId !== (session.user as any).id) {
    throw new Error("Ви можете видаляти лише свої коментарі");
  }

  // Видаляємо коментар
  await prisma.comment.delete({
    where: { id: commentId }
  });

  revalidatePath("/profile");
  revalidatePath(`/article/${comment.news.slug}`);
  return { success: true };
}
