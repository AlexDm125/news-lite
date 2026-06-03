import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Перевіряємо що користувач авторизований
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: 0, message: "Неавторизований доступ" }, { status: 401 });
    }

    // Перевіряємо що користувач не заблокований
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { status: true }
    });

    if (user?.status === "BLOCKED") {
      return NextResponse.json({ 
        success: 0, 
        message: "Ваш обліковий запис заблокований. Ви не можете завантажувати зображення." 
      }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: 0, message: "Файл не знайдено" }, { status: 400 });
    }

    // Конвертуємо файл у буфер для Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "news_assets" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Повертаємо відповідь у строгому форматі Editor.js Image Tool
    return NextResponse.json({
      success: 1,
      file: {
        url: uploadResult.secure_url,
      },
    });
  } catch (error) {
    console.error("Помилка завантаження фото:", error);
    return NextResponse.json({ success: 0, message: "Помилка сервера при завантаженні" }, { status: 500 });
  }
}
