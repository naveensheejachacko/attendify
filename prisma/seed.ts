import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Attendify@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
      deletedAt: null,
    },
    create: {
      name: "College Admin",
      email: "admin@college.edu",
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  const advisor = await prisma.user.upsert({
    where: { email: "advisor@college.edu" },
    update: {
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
      deletedAt: null,
    },
    create: {
      name: "Priya Nair",
      email: "advisor@college.edu",
      passwordHash,
      role: "TEACHER",
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  const lecturer = await prisma.user.upsert({
    where: { email: "lecturer@college.edu" },
    update: {
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
      deletedAt: null,
    },
    create: {
      name: "Arun Menon",
      email: "lecturer@college.edu",
      passwordHash,
      role: "TEACHER",
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  const subject = await prisma.subject.upsert({
    where: { code: "CS301" },
    update: {},
    create: { code: "CS301", name: "Database Systems" },
  });

  const maths = await prisma.subject.upsert({
    where: { code: "MA201" },
    update: {},
    create: { code: "MA201", name: "Discrete Mathematics" },
  });

  let cls = await prisma.class.findFirst({ where: { name: "CSE 2024 A — S5" } });
  if (!cls) {
    cls = await prisma.class.create({
      data: {
        name: "CSE 2024 A — S5",
        program: "B.Tech Computer Science",
        section: "A",
        batchYear: 2024,
        semester: 5,
        classTeacherId: advisor.id,
      },
    });
  }

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: cls.id, subjectId: subject.id } },
    update: { teacherId: lecturer.id },
    create: { classId: cls.id, subjectId: subject.id, teacherId: lecturer.id },
  });

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: cls.id, subjectId: maths.id } },
    update: { teacherId: advisor.id },
    create: { classId: cls.id, subjectId: maths.id, teacherId: advisor.id },
  });

  await prisma.student.createMany({
    skipDuplicates: true,
    data: [
      { classId: cls.id, rollNumber: "21CS001", name: "Ada Lovelace" },
      { classId: cls.id, rollNumber: "21CS002", name: "Alan Turing" },
      { classId: cls.id, rollNumber: "21CS003", name: "Grace Hopper" },
      { classId: cls.id, rollNumber: "21CS004", name: "Edsger Dijkstra" },
    ],
  });

  console.info("Seeded demo users:");
  console.info("  admin@college.edu / Attendify@123");
  console.info("  advisor@college.edu / Attendify@123  (class teacher)");
  console.info("  lecturer@college.edu / Attendify@123 (subject teacher)");
  console.info(`Admin id ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
