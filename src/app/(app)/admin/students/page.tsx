import { StudentForms } from "@/components/admin-forms";
import { prisma } from "@/lib/db";

export default async function StudentsPage() {
  const [classes, students] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({
      include: { class: true },
      orderBy: [{ class: { name: "asc" } }, { rollNumber: "asc" }],
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Students</h1>
      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <StudentForms
          classes={classes.map((item) => ({ id: item.id, label: item.name }))}
        />
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {students.map((student) => (
          <li key={student.id} className="flex gap-4 px-5 py-3 text-sm">
            <span className="w-28 font-mono text-ink/50">{student.rollNumber}</span>
            <span className="flex-1">{student.name}</span>
            <span className="text-ink/50">{student.class.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
