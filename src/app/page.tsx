import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-full bg-paper">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-mark">
            College attendance
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-ink">
            Hour-wise attendance without the register pile.
          </h1>
          <p className="mt-4 max-w-md text-ink/70">
            Subject teachers mark the hour. Class teachers see every subject.
            Admin owns classes, subjects, and assignments.
          </p>
          <div className="mt-8 flex gap-3 text-sm">
            <Link className="rounded-full bg-ink px-5 py-2.5 text-paper" href="/register">
              Faculty register
            </Link>
            <Link className="rounded-full border border-ink/15 px-5 py-2.5" href="/login">
              Log in
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_20px_50px_-24px_rgba(27,42,74,0.35)]">
          <h2 className="font-serif text-2xl">Create faculty account</h2>
          <p className="mb-6 mt-1 text-sm text-ink/60">
            Email and password, then admin approval. No OTP for now. The first account on an empty system is admin.
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
