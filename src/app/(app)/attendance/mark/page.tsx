import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MarkListPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const teaching = await prisma.classSubject.findMany({
    where: user.role === Role.ADMIN ? {} : { teacherId: user.id },
    include: { class: true, subject: true, teacher: true },
    orderBy: { class: { name: "asc" } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Mark attendance</h1>
      {teaching.length === 0 ? (
        <p className="text-sm text-ink/60">No subject assigned yet.</p>
      ) : (
        <div className="grid gap-3">
          {teaching.map((item) => (
            <Link
              key={item.id}
              href={`/attendance/mark/${item.id}`}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="text-xs uppercase tracking-widest text-mark">
                {item.subject.code}
              </div>
              <div className="font-medium">
                {item.subject.name} · {item.class.name}
              </div>
              {user.role === Role.ADMIN ? (
                <div className="text-sm text-ink/50">{item.teacher.name}</div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
