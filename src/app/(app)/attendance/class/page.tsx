import { prisma } from "@/lib/db";
import { activeStudentWhere } from "@/lib/people";
import { AttendanceStatus, Role } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

function percent(attended: number, total: number): string {
  if (total === 0) {
    return "—";
  }
  return `${Math.round((attended / total) * 100)}%`;
}

export default async function ClassAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const query = await searchParams;

  const classes =
    user.role === Role.ADMIN
      ? await prisma.class.findMany({ orderBy: { name: "asc" } })
      : await prisma.class.findMany({
          where: { classTeacherId: user.id },
          orderBy: { name: "asc" },
        });

  if (classes.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="font-serif text-3xl">Class attendance</h1>
        <p className="text-sm text-ink/60">
          Only the assigned class teacher (and admin) can open the full-class register.
        </p>
      </div>
    );
  }

  const classId = query.classId && classes.some((cls) => cls.id === query.classId)
    ? query.classId
    : classes[0].id;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: { where: activeStudentWhere, orderBy: { rollNumber: "asc" } },
      subjects: {
        include: {
          subject: true,
          teacher: { select: { name: true } },
          sessions: { include: { records: true } },
        },
      },
    },
  });
  if (!cls) {
    redirect("/attendance/class");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Class attendance</h1>
        <p className="text-sm text-ink/60">
          Present, late, and on-duty count as attended. Short of 75% is flagged.
        </p>
      </div>
      <ClassPicker classes={classes} classId={classId} />
      <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Roll</th>
              <th className="px-4 py-3">Student</th>
              {cls.subjects.map((item) => (
                <th key={item.id} className="px-4 py-3">
                  {item.subject.code}
                  <div className="normal-case tracking-normal text-ink/40">
                    {item.teacher.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cls.students.map((student) => (
              <tr key={student.id} className="border-b border-ink/5">
                <td className="px-4 py-3 font-mono text-xs text-ink/50">
                  {student.rollNumber}
                </td>
                <td className="px-4 py-3">{student.name}</td>
                {cls.subjects.map((item) => {
                  const total = item.sessions.length;
                  const attended = item.sessions.filter((session) =>
                    session.records.some(
                      (record) =>
                        record.studentId === student.id &&
                        record.status !== AttendanceStatus.ABSENT,
                    ),
                  ).length;
                  const value = percent(attended, total);
                  const low = total > 0 && attended / total < 0.75;
                  return (
                    <td
                      key={item.id}
                      className={`px-4 py-3 ${low ? "font-semibold text-coral" : ""}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClassPicker({
  classes,
  classId,
}: {
  classes: { id: string; name: string }[];
  classId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {classes.map((item) => (
        <a
          key={item.id}
          href={`/attendance/class?classId=${item.id}`}
          className={`rounded-full px-3 py-1.5 text-sm ${
            item.id === classId ? "bg-ink text-paper" : "border border-ink/15"
          }`}
        >
          {item.name}
        </a>
      ))}
    </div>
  );
}
