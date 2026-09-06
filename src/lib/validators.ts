import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const verifySchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/),
});

export const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const classSchema = z.object({
  name: z.string().trim().min(2).max(120),
  program: z.string().trim().min(2).max(120),
  section: z.string().trim().min(1).max(12),
  batchYear: z.coerce.number().int().min(2000).max(2100),
  semester: z.coerce.number().int().min(1).max(12),
  classTeacherId: z.string().optional(),
});

export const subjectSchema = z.object({
  code: z.string().trim().min(2).max(20).toUpperCase(),
  name: z.string().trim().min(2).max(120),
});

export const assignSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
});

export const studentSchema = z.object({
  classId: z.string().min(1),
  rollNumber: z.string().trim().min(1).max(32),
  name: z.string().trim().min(2).max(80),
});

export const facultyUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const studentUpdateSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  rollNumber: z.string().trim().min(1).max(32),
  name: z.string().trim().min(2).max(80),
});

export const idSchema = z.object({
  id: z.string().min(1),
});
