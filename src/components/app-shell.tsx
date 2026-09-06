import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/session";
import { Role } from "@/lib/roles";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/attendance/mark", label: "Mark" },
    { href: "/attendance/class", label: "Class view" },
    ...(user.role === Role.ADMIN
      ? [
          { href: "/admin/classes", label: "Classes" },
          { href: "/admin/subjects", label: "Subjects" },
          { href: "/admin/assignments", label: "Assign" },
          { href: "/admin/students", label: "Students" },
        ]
      : []),
    { href: "/settings", label: "Account" },
  ];

  return (
    <div className="min-h-full bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="font-serif text-xl tracking-tight">
            Attendify
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {links.map((link) => (
              <Link key={link.href} className="text-ink/70 hover:text-ink" href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button className="text-sm text-ink/60 hover:text-ink">Log out</button>
          </form>
        </div>
        <nav className="flex gap-3 overflow-x-auto px-4 pb-3 text-sm md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              className="shrink-0 rounded-full border border-ink/10 px-3 py-1 text-ink/80"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
