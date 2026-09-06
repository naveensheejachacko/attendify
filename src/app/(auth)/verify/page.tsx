import { VerifyForm } from "@/components/verify-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const query = await searchParams;
  const email = query.email ?? "";
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl">Verify email</h1>
      <p className="mb-8 mt-2 text-sm text-ink/60">
        {email
          ? `Enter the 6-digit code we emailed to ${email}. Check spam if you do not see it.`
          : "Open this page from the register flow so we know which email to verify."}
      </p>
      {email ? <VerifyForm email={email} /> : null}
    </div>
  );
}
