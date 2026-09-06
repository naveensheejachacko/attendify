import { LoginForm } from "@/components/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl">Log in</h1>
      <p className="mb-8 mt-2 text-sm text-ink/60">
        {status === "pending"
          ? "Account created. Ask admin to approve you on the Faculty page, then log in."
          : "Faculty must be approved by admin after signup."}
      </p>
      <LoginForm />
    </div>
  );
}
