import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl">Log in</h1>
      <p className="mb-8 mt-2 text-sm text-ink/60">
        Use your verified college email.
      </p>
      <LoginForm />
    </div>
  );
}
