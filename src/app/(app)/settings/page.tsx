import { PasswordForm } from "@/components/password-form";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Account</h1>
        <p className="mt-1 text-sm text-ink/60">
          {user.name} · {user.email} · {user.role === "ADMIN" ? "Admin" : "Faculty"}
        </p>
      </div>
      <PasswordForm />
    </div>
  );
}
