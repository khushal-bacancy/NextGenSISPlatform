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

export const EnrollmentDocumentSchema = z.object({
  documentType: z.enum(["birth_certificate", "proof_of_address", "immunization", "other"]),
  filePath: z.string().min(3),
  originalFileName: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected"])
});

export const EnrollmentVerificationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  notes: z.string().max(500).optional()
});

export const EnrollmentSubmissionSchema = StudentEnrollmentSchema.extend({
  documents: z.array(EnrollmentDocumentSchema).default([]),
  verification: EnrollmentVerificationSchema
});

export const RegistrationRequestSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  schoolId: z.string().uuid().optional(),
  gradeLevel: z.number().int().min(1).max(12),
  documents: z.array(
    z.object({
      documentType: z.enum(["birth_certificate", "proof_of_address", "immunization", "other"]),
      filePath: z.string().min(3),
      originalFileName: z.string().min(1)
    })
  )
});

export const RegistrationStatusRequestSchema = z.object({
  email: z.string().email()
});

export const StorageUploadUrlSchema = z.object({
  path: z.string().min(3).max(500)
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

export const TranscriptEntrySchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  term: z.string().min(1).max(40),
  gpa: z.number().min(0).max(4.5),
  creditsEarned: z.number().min(0),
  creditsAttempted: z.number().min(0),
  classRank: z.string().max(30).optional(),
  summary: z.record(z.unknown()).optional()
});

export const AcademicRecordSchema = z.object({
  studentId: z.string().uuid(),
  schoolId: z.string().uuid(),
  recordType: z.enum(["achievement", "discipline", "note", "transfer", "honor", "assessment"]),
  title: z.string().min(2).max(160),
  details: z.record(z.unknown()).optional(),
  recordedAt: z.string().date()
});

export type StudentEnrollmentInput = z.infer<typeof StudentEnrollmentSchema>;
export type AttendanceEntryInput = z.infer<typeof AttendanceEntrySchema>;
export type GradeEntryInput = z.infer<typeof GradeEntrySchema>;
export type ReportQueryInput = z.infer<typeof ReportQuerySchema>;
export type TranscriptEntryInput = z.infer<typeof TranscriptEntrySchema>;
export type AcademicRecordInput = z.infer<typeof AcademicRecordSchema>;
export type SchoolCreateInput = z.infer<typeof SchoolCreateSchema>;
export type UserInviteInput = z.infer<typeof UserInviteSchema>;
export type EnrollmentSubmissionInput = z.infer<typeof EnrollmentSubmissionSchema>;
export type RegistrationRequestInput = z.infer<typeof RegistrationRequestSchema>;
export type RegistrationStatusRequestInput = z.infer<typeof RegistrationStatusRequestSchema>;
export type StorageUploadUrlInput = z.infer<typeof StorageUploadUrlSchema>;
