import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Невірна адреса email"),
  password: z.string().min(1, "Пароль обов'язковий"),
  remember: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Ім'я має бути мінімум 2 символи"),
    email: z.string().email("Невірна адреса email"),
    password: z.string().min(6, "Пароль має бути мінімум 6 символів"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Паролі не збігаються",
    path: ["passwordConfirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
