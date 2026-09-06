import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Role } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }
  return children;
}
