"use server";

import { signOut, signIn, auth } from "@/auth";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import * as bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function checkAdmin() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Неавторизований доступ");
  }
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

export async function registerAction(formData: FormData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  };

  const validatedData = registerSchema.safeParse(data);
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  // Перевірка email на унікальність
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.data.email },
  });

  if (existingUser) {
    return {
      success: false,
      errors: {
        email: ["Цей email вже зареєстрований"],
      },
    };
  }

  // Хешування пароля
  const hashedPassword = await bcrypt.hash(validatedData.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: validatedData.data.name,
        email: validatedData.data.email,
        password: hashedPassword,
      },
    });

    // Автоматичний логін після реєстрації
    await signIn("credentials", {
      email: validatedData.data.email,
      password: validatedData.data.password,
      redirect: false,
    });

    revalidatePath("/");

    return {
      success: true,
      message: "Реєстрація успішна!",
      autoLogin: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Помилка при реєстрації",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/");
}

export async function blockUserAction(userId: string) {
  await checkAdmin();
  await checkNotBlocked();
  await prisma.user.update({
    where: { id: userId },
    data: { status: "BLOCKED" },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function unblockUserAction(userId: string) {
  await checkAdmin();
  await checkNotBlocked();
  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateCommentStatusAction(
  commentId: string,
  newStatus: "ACTIVE" | "HIDDEN" | "PENDING"
) {
  await checkAdmin();
  await checkNotBlocked();
  await prisma.comment.update({
    where: { id: commentId },
    data: { status: newStatus },
  });
  revalidatePath("/admin/comments");
  return { success: true };
}

export async function deleteCommentAction(commentId: string) {
  await checkAdmin();
  await checkNotBlocked();
  await prisma.comment.delete({
    where: { id: commentId },
  });
  revalidatePath("/admin/comments");
  return { success: true };
}

export async function updateUserProfile(data: {
  name: string;
  email: string;
  oldPassword?: string;
  newPassword?: string;
}) {
  try {
    await checkNotBlocked();
  } catch (error) {
    return { error: "Ваш обліковий запис заблокований" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Неавторизований доступ" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user) {
      return { error: "Користувач не знайдений" };
    }

    if (data.newPassword) {
      if (!data.oldPassword) {
        return { error: "Введіть старий пароль" };
      }

      const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password!);
      if (!isPasswordValid) {
        return { error: "Старий пароль неправильний" };
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      await prisma.user.update({
        where: { id: (session.user as any).id },
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: (session.user as any).id },
        data: {
          name: data.name,
          email: data.email,
        },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/profile-edit");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Помилка при оновленні профілю" };
  }
}
