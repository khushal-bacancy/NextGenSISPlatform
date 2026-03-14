import { z } from "zod";

export const RoleSchema = z.enum([
  "super_admin",
  "school_admin",
  "staff",
  "teacher",
  "parent",
  "student"
]);

export const SchoolCreateSchema = z.object({
  name: z.string().min(3).max(150)
});

export const UserInviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  role: z.enum(["school_admin", "staff", "teacher"]),
  schoolId: z.string().uuid()
});

export const StudentEnrollmentSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  studentNumber: z.string().min(3).max(30),
  schoolId: z.string().uuid(),
  gradeLevel: z.number().int().min(1).max(12),
  enrollmentDate: z.string().date()
});

export const AttendanceEntrySchema = z.object({
  studentId: z.string().uuid(),
  sectionId: z.string().uuid(),
  attendanceDate: z.string().date(),
  status: z.enum(["present", "absent", "tardy", "excused"]),
  note: z.string().max(500).optional()
});

export const GradeEntrySchema = z.object({
  studentId: z.string().uuid(),
  sectionId: z.string().uuid(),
  assessmentName: z.string().min(2).max(120),
  pointsEarned: z.number().min(0),
  pointsPossible: z.number().min(1),
  submittedAt: z.string().datetime()
});

export const ReportQuerySchema = z.object({
  studentId: z.string().uuid(),
  term: z.string().min(1).max(30)
});

export type StudentEnrollmentInput = z.infer<typeof StudentEnrollmentSchema>;
export type AttendanceEntryInput = z.infer<typeof AttendanceEntrySchema>;
export type GradeEntryInput = z.infer<typeof GradeEntrySchema>;
export type ReportQueryInput = z.infer<typeof ReportQuerySchema>;
export type SchoolCreateInput = z.infer<typeof SchoolCreateSchema>;
export type UserInviteInput = z.infer<typeof UserInviteSchema>;
