import { AssignForm } from "@/components/admin-forms";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";

export default async function AssignmentsPage() {
  const [classes, subjects, teachers, assignments] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { code: "asc" } }),
    prisma.user.findMany({
      where: { role: Role.TEACHER, emailVerifiedAt: { not: null } },
      orderBy: { name: "asc" },
    }),
    prisma.classSubject.findMany({
      include: { class: true, subject: true, teacher: true },
      orderBy: { class: { name: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Assign teachers</h1>
        <p className="mt-1 text-sm text-ink/60">
          A subject teacher can mark that paper. A class teacher (advisor) is set on the class.
        </p>
      </div>
      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <AssignForm
          classes={classes.map((item) => ({ id: item.id, label: item.name }))}
          subjects={subjects.map((item) => ({
            id: item.id,
            label: `${item.code} — ${item.name}`,
          }))}
          teachers={teachers.map((item) => ({
            id: item.id,
            label: `${item.name} (${item.email})`,
          }))}
        />
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {assignments.map((item) => (
          <li key={item.id} className="px-5 py-4 text-sm">
            <span className="font-medium">{item.class.name}</span>
            <span className="text-ink/40"> · </span>
            <span>
              {item.subject.code} {item.subject.name}
            </span>
            <span className="text-ink/40"> · </span>
            <span>{item.teacher.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
