import { CreateSubjectForm } from "@/components/admin-forms";
import { prisma } from "@/lib/db";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { code: "asc" } });
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Subjects</h1>
      <div className="rounded-2xl border border-ink/10 bg-white p-6">
        <CreateSubjectForm />
      </div>
      <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {subjects.map((subject) => (
          <li key={subject.id} className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-sm text-mark">{subject.code}</span>
            <span className="text-sm">{subject.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
