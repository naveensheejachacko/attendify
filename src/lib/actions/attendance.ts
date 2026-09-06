"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AttendanceStatus, Role } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/actions/auth";

const STATUSES = new Set<string>(Object.values(AttendanceStatus));

export async function saveAttendanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const classSubjectId = String(formData.get("classSubjectId") ?? "");
  const dateRaw = String(formData.get("date") ?? "");
  const period = Number(formData.get("period") ?? 1);

  if (!classSubjectId || !dateRaw || !Number.isInteger(period) || period < 1 || period > 8) {
    return { error: "Select a valid date and period (1–8)." };
  }

  const assignment = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: { class: { include: { students: true } } },
  });
  if (!assignment) {
    return { error: "Subject assignment not found." };
  }
  if (user.role !== Role.ADMIN && assignment.teacherId !== user.id) {
    return { error: "You are not assigned to this subject." };
  }

  const date = new Date(`${dateRaw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: "Invalid date." };
  }

  const marks = assignment.class.students.map((student) => {
    const status = String(formData.get(`status-${student.id}`) ?? AttendanceStatus.ABSENT);
    return {
      studentId: student.id,
      status: STATUSES.has(status) ? status : AttendanceStatus.ABSENT,
    };
  });

  await prisma.$transaction(async (tx) => {
    const session = await tx.attendanceSession.upsert({
      where: {
        classSubjectId_date_period: {
          classSubjectId,
          date,
          period,
        },
      },
      update: { markedById: user.id },
      create: {
        classSubjectId,
        date,
        period,
        markedById: user.id,
      },
    });

    for (const mark of marks) {
      await tx.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: mark.studentId,
          },
        },
        update: { status: mark.status },
        create: {
          sessionId: session.id,
          studentId: mark.studentId,
          status: mark.status,
        },
      });
    }
  });

  revalidatePath(`/attendance/mark/${classSubjectId}`);
  revalidatePath("/attendance/class");
  return { message: "Attendance saved." };
}
