import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [teaching, advising, classCount, subjectCount, teacherCount] =
    await Promise.all([
      prisma.classSubject.findMany({
        where: { teacherId: user.id },
        include: { class: true, subject: true },
        orderBy: { class: { name: "asc" } },
      }),
      prisma.class.findMany({
        where: { classTeacherId: user.id },
        include: { _count: { select: { students: true } } },
      }),
      user.role === Role.ADMIN ? prisma.class.count() : Promise.resolve(0),
      user.role === Role.ADMIN ? prisma.subject.count() : Promise.resolve(0),
      user.role === Role.ADMIN
        ? prisma.user.count({ where: { role: Role.TEACHER } })
        : Promise.resolve(0),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
          {user.role === Role.ADMIN ? "Administrator" : "Faculty"}
        </p>
        <h1 className="font-serif text-3xl">Hello, {user.name.split(" ")[0]}</h1>
      </div>

      {user.role === Role.ADMIN ? (
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/admin/classes", label: "Classes", value: classCount },
            { href: "/admin/subjects", label: "Subjects", value: subjectCount },
            { href: "/admin/assignments", label: "Faculty", value: teacherCount },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="text-3xl font-serif">{card.value}</div>
              <div className="mt-1 text-sm text-ink/60">{card.label}</div>
            </Link>
          ))}
        </section>
      ) : null}

      {advising.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-serif text-xl">Your class (advisor view)</h2>
          <div className="grid gap-3">
            {advising.map((cls) => (
              <Link
                key={cls.id}
                href={`/attendance/class?classId=${cls.id}`}
                className="rounded-2xl border border-ink/10 bg-white p-5"
              >
                <div className="font-medium">{cls.name}</div>
                <div className="text-sm text-ink/60">
                  {cls._count.students} students · all subjects
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-serif text-xl">Subjects you take</h2>
        {teaching.length === 0 ? (
          <p className="text-sm text-ink/60">
            {user.role === Role.ADMIN
              ? "Assign yourself or a teacher to a class subject to mark attendance."
              : "Admin has not assigned you a subject yet."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {teaching.map((item) => (
              <Link
                key={item.id}
                href={`/attendance/mark/${item.id}`}
                className="rounded-2xl border border-ink/10 bg-white p-5"
              >
                <div className="text-xs uppercase tracking-widest text-mark">
                  {item.subject.code}
                </div>
                <div className="mt-1 font-medium">{item.subject.name}</div>
                <div className="text-sm text-ink/60">{item.class.name}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
