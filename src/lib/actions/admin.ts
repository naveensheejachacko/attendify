"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { activeFacultyWhere, activeStudentWhere } from "@/lib/people";
import { Role } from "@/lib/roles";
import { requireAdmin } from "@/lib/session";
import {
  assignSchema,
  bulkStudentsSchema,
  classSchema,
  facultyUpdateSchema,
  idSchema,
  studentSchema,
  studentUpdateSchema,
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
      where: { id: classTeacherId, ...activeFacultyWhere },
    });
    if (!teacher) {
      return { error: "Class teacher must be an approved faculty account." };
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
    where: { id: parsed.data.teacherId, ...activeFacultyWhere },
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

function revalidatePeople() {
  revalidatePath("/admin/faculty");
  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/assignments");
  revalidatePath("/dashboard");
}

export async function approveFacultyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return;
  }
  const faculty = await prisma.user.findFirst({
    where: { id: parsed.data.id, role: Role.TEACHER, deletedAt: null },
  });
  if (!faculty) {
    return;
  }
  await prisma.user.update({
    where: { id: faculty.id },
    data: { approvedAt: new Date() },
  });
  revalidatePeople();
}

export async function updateFacultyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = facultyUpdateSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter a valid name and email." };
  }
  const faculty = await prisma.user.findFirst({
    where: { id: parsed.data.id, role: Role.TEACHER },
  });
  if (!faculty || faculty.deletedAt) {
    return { error: "Faculty not found." };
  }
  try {
    await prisma.user.update({
      where: { id: faculty.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ? parsed.data.phone : null,
      },
    });
  } catch {
    return { error: "That email or phone is already in use." };
  }
  revalidatePeople();
  revalidatePath(`/admin/faculty/${faculty.id}`);
  return { message: "Faculty details saved." };
}

export async function softDeleteFacultyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return;
  }
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: parsed.data.id, role: Role.TEACHER, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
    prisma.class.updateMany({
      where: { classTeacherId: parsed.data.id },
      data: { classTeacherId: null },
    }),
  ]);
  revalidatePeople();
}

export async function restoreFacultyAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return;
  }
  await prisma.user.updateMany({
    where: { id: parsed.data.id, role: Role.TEACHER },
    data: { deletedAt: null },
  });
  revalidatePeople();
}

export async function updateStudentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = studentUpdateSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { error: "Enter class, roll number, and name." };
  }
  const student = await prisma.student.findUnique({ where: { id: parsed.data.id } });
  if (!student || student.deletedAt) {
    return { error: "Student not found." };
  }
  try {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        classId: parsed.data.classId,
        rollNumber: parsed.data.rollNumber,
        name: parsed.data.name,
      },
    });
  } catch {
    return { error: "That roll number already exists in the selected class." };
  }
  revalidatePeople();
  revalidatePath(`/admin/students/${student.id}`);
  return { message: "Student details saved." };
}

export async function softDeleteStudentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return;
  }
  await prisma.student.updateMany({
    where: { id: parsed.data.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  revalidatePeople();
}

export async function restoreStudentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return;
  }
  await prisma.student.updateMany({
    where: { id: parsed.data.id },
    data: { deletedAt: null },
  });
  revalidatePeople();
}
