import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Вхід</h1>
      <p className="text-gray-600 mb-8">Увійдіть до свого облікового запису</p>

      <LoginForm />
    </div>
  );
}
