import Link from "next/link";
import { StudentForms } from "@/components/admin-forms";
import {
  restoreStudentAction,
  softDeleteStudentAction,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/db";

export default async function StudentsPage() {
  const [classes, active, removed] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({
      where: { deletedAt: null },
      include: { class: true },
      orderBy: [{ class: { name: "asc" } }, { rollNumber: "asc" }],
    }),
    prisma.student.findMany({
      where: { deletedAt: { not: null } },
      include: { class: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const classOptions = classes.map((item) => ({ id: item.id, label: item.name }));

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Students</h1>
      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <StudentForms classes={classOptions} />
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {active.map((student) => (
          <li key={student.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
            <span className="w-28 font-mono text-ink/50">{student.rollNumber}</span>
            <span className="flex-1">{student.name}</span>
            <span className="text-ink/50">{student.class.name}</span>
            <Link
              className="rounded-full border border-ink/15 px-3 py-1 text-xs"
              href={`/admin/students/${student.id}`}
            >
              Edit
            </Link>
            <form action={softDeleteStudentAction}>
              <input type="hidden" name="id" value={student.id} />
              <button className="rounded-full border border-coral/40 px-3 py-1 text-xs text-coral">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
      {removed.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-serif text-xl">Removed</h2>
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
            {removed.map((student) => (
              <li
                key={student.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm text-ink/60"
              >
                <span className="w-28 font-mono">{student.rollNumber}</span>
                <span className="flex-1">{student.name}</span>
                <span>{student.class.name}</span>
                <form action={restoreStudentAction}>
                  <input type="hidden" name="id" value={student.id} />
                  <button className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink">
                    Restore
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
