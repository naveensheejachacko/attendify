import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl">Register</h1>
      <p className="mb-8 mt-2 text-sm text-ink/60">
        We send a 6-digit code to verify your email. After that, admin approves faculty before login.
      </p>
      <RegisterForm />
    </div>
  );
}
