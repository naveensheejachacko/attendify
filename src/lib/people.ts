import type { Prisma } from "@prisma/client";
import { Role } from "@/lib/roles";

export const activeFacultyWhere: Prisma.UserWhereInput = {
  role: Role.TEACHER,
  deletedAt: null,
  emailVerifiedAt: { not: null },
  approvedAt: { not: null },
};

export const activeStudentWhere: Prisma.StudentWhereInput = {
  deletedAt: null,
};
