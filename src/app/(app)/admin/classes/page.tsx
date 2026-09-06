import { CreateClassForm } from "@/components/admin-forms";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";

export default async function ClassesPage() {
  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      include: {
        classTeacher: { select: { name: true, email: true } },
        _count: { select: { students: true, subjects: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: Role.TEACHER, emailVerifiedAt: { not: null } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Classes</h1>
      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <CreateClassForm
          teachers={teachers.map((teacher) => ({
            id: teacher.id,
            label: `${teacher.name} (${teacher.email})`,
          }))}
        />
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {classes.map((cls) => (
          <li key={cls.id} className="px-5 py-4">
            <div className="font-medium">{cls.name}</div>
            <div className="text-sm text-ink/60">
              {cls.program} · Sec {cls.section} · {cls.batchYear} · Sem {cls.semester} ·{" "}
              {cls._count.students} students · {cls._count.subjects} subjects · Advisor{" "}
              {cls.classTeacher?.name ?? "unassigned"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
