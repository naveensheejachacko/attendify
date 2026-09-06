import Link from "next/link";
import { EditStudentForm } from "@/components/admin-forms";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, classes] = await Promise.all([
    prisma.student.findUnique({ where: { id } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!student || student.deletedAt) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link className="text-sm text-mark" href="/admin/students">
        ← Students
      </Link>
      <h1 className="font-serif text-3xl">Edit student</h1>
      <EditStudentForm
        student={{
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          classId: student.classId,
        }}
        classes={classes.map((item) => ({ id: item.id, label: item.name }))}
      />
    </div>
  );
}
