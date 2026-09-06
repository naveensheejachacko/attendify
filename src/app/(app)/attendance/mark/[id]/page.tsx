import { MarkAttendanceForm } from "@/components/mark-form";
import { todayInCollege } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { AttendanceStatus, Role } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

export default async function MarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const { id } = await params;
  const assignment = await prisma.classSubject.findUnique({
    where: { id },
    include: {
      class: { include: { students: { orderBy: { rollNumber: "asc" } } } },
      subject: true,
    },
  });
  if (!assignment) {
    notFound();
  }
  if (user.role !== Role.ADMIN && assignment.teacherId !== user.id) {
    redirect("/attendance/mark");
  }

  const defaultDate = todayInCollege();
  const sessionDate = new Date(`${defaultDate}T00:00:00.000Z`);
  const existing = await prisma.attendanceSession.findFirst({
    where: { classSubjectId: id, date: sessionDate, period: 1 },
    include: { records: true },
  });
  const initialMarks = Object.fromEntries(
    assignment.class.students.map((student) => [
      student.id,
      existing?.records.find((record) => record.studentId === student.id)?.status ??
        AttendanceStatus.PRESENT,
    ]),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-mark">{assignment.subject.code}</p>
        <h1 className="font-serif text-3xl">{assignment.subject.name}</h1>
        <p className="text-sm text-ink/60">{assignment.class.name}</p>
      </div>
      {assignment.class.students.length === 0 ? (
        <p className="text-sm text-ink/60">Add students to this class before marking.</p>
      ) : (
        <MarkAttendanceForm
          classSubjectId={assignment.id}
          students={assignment.class.students}
          initialMarks={initialMarks}
          defaultDate={defaultDate}
        />
      )}
    </div>
  );
}
