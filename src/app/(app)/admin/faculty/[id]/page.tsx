import Link from "next/link";
import { EditFacultyForm } from "@/components/admin-forms";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";
import { notFound } from "next/navigation";

export default async function EditFacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faculty = await prisma.user.findFirst({
    where: { id, role: Role.TEACHER },
  });
  if (!faculty || faculty.deletedAt) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link className="text-sm text-mark" href="/admin/faculty">
        ← Faculty
      </Link>
      <h1 className="font-serif text-3xl">Edit faculty</h1>
      <EditFacultyForm
        faculty={{
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          phone: faculty.phone,
        }}
      />
    </div>
  );
}
