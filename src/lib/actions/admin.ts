"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/roles";
import { requireAdmin } from "@/lib/session";
import {
  assignSchema,
  bulkStudentsSchema,
  classSchema,
  studentSchema,
  subjectSchema,
} from "@/lib/validators";
import type { ActionState } from "@/lib/actions/auth";

function formValues(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createClassAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = classSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Fill in class name, program, section, batch year, and semester." };
  }

  const classTeacherId =
    parsed.data.classTeacherId && parsed.data.classTeacherId.length > 0
      ? parsed.data.classTeacherId
      : null;

  if (classTeacherId) {
    const teacher = await prisma.user.findFirst({
      where: { id: classTeacherId, role: Role.TEACHER, emailVerifiedAt: { not: null } },
    });
    if (!teacher) {
      return { error: "Class teacher must be a verified teacher account." };
    }
  }

  await prisma.class.create({
    data: {
      name: parsed.data.name,
      program: parsed.data.program,
      section: parsed.data.section,
      batchYear: parsed.data.batchYear,
      semester: parsed.data.semester,
      classTeacherId,
    },
  });
  revalidatePath("/admin/classes");
  return { message: "Class created." };
}

export async function createSubjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = subjectSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter a subject code and name." };
  }
  try {
    await prisma.subject.create({
      data: { code: parsed.data.code, name: parsed.data.name },
    });
  } catch {
    return { error: "That subject code already exists." };
  }
  revalidatePath("/admin/subjects");
  return { message: "Subject added." };
}

export async function assignTeacherAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = assignSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Select class, subject, and teacher." };
  }

  const teacher = await prisma.user.findFirst({
    where: {
      id: parsed.data.teacherId,
      role: Role.TEACHER,
      emailVerifiedAt: { not: null },
    },
  });
  if (!teacher) {
    return { error: "Teacher account is not valid." };
  }

  await prisma.classSubject.upsert({
    where: {
      classId_subjectId: {
        classId: parsed.data.classId,
        subjectId: parsed.data.subjectId,
      },
    },
    update: { teacherId: parsed.data.teacherId },
    create: {
      classId: parsed.data.classId,
      subjectId: parsed.data.subjectId,
      teacherId: parsed.data.teacherId,
    },
  });
  revalidatePath("/admin/assignments");
  return { message: "Teacher assigned to subject." };
}

export async function addStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = studentSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter class, roll number, and student name." };
  }
  try {
    await prisma.student.create({
      data: {
        classId: parsed.data.classId,
        rollNumber: parsed.data.rollNumber,
        name: parsed.data.name,
      },
    });
  } catch {
    return { error: "That roll number already exists in this class." };
  }
  revalidatePath("/admin/students");
  return { message: "Student added." };
}

export async function bulkAddStudentsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = bulkStudentsSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Paste students as one per line: roll, name." };
  }

  const rows = parsed.data.rows
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rollNumber, ...nameParts] = line.split(/[,\t]/);
      return {
        rollNumber: rollNumber?.trim() ?? "",
        name: nameParts.join(" ").trim(),
      };
    })
    .filter((row) => row.rollNumber && row.name);

  if (rows.length === 0) {
    return { error: "No valid rows. Use: 21CS001, Ada Lovelace" };
  }

  await prisma.student.createMany({
    data: rows.map((row) => ({
      classId: parsed.data.classId,
      rollNumber: row.rollNumber,
      name: row.name,
    })),
    skipDuplicates: true,
  });
  revalidatePath("/admin/students");
  return { message: `Imported ${rows.length} student row(s). Duplicates were skipped.` };
}
