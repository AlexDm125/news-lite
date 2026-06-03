import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-lg w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Реєстрація</h1>
      <p className="text-gray-600 mb-8">Створіть свій обліковий запис</p>

      <RegisterForm />
    </div>
  );
}
