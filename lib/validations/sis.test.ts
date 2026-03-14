import { describe, expect, it } from "vitest";

import { AttendanceEntrySchema, GradeEntrySchema, StudentEnrollmentSchema } from "@/lib/validations/sis";

describe("StudentEnrollmentSchema", () => {
  it("accepts valid enrollment payload", () => {
    const parsed = StudentEnrollmentSchema.safeParse({
      firstName: "Ava",
      lastName: "Shaw",
      studentNumber: "S-1001",
      schoolId: "11111111-1111-1111-1111-111111111111",
      gradeLevel: 7,
      enrollmentDate: "2026-03-14"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects out-of-range grade level", () => {
    const parsed = StudentEnrollmentSchema.safeParse({
      firstName: "Ava",
      lastName: "Shaw",
      studentNumber: "S-1001",
      schoolId: "11111111-1111-1111-1111-111111111111",
      gradeLevel: 0,
      enrollmentDate: "2026-03-14"
    });

    expect(parsed.success).toBe(false);
  });
});

describe("AttendanceEntrySchema", () => {
  it("accepts valid attendance payload", () => {
    const parsed = AttendanceEntrySchema.safeParse({
      studentId: "11111111-1111-1111-1111-111111111111",
      sectionId: "22222222-2222-2222-2222-222222222222",
      attendanceDate: "2026-03-14",
      status: "present"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const parsed = AttendanceEntrySchema.safeParse({
      studentId: "11111111-1111-1111-1111-111111111111",
      sectionId: "22222222-2222-2222-2222-222222222222",
      attendanceDate: "2026-03-14",
      status: "late"
    });

    expect(parsed.success).toBe(false);
  });
});

describe("GradeEntrySchema", () => {
  it("accepts valid grade payload", () => {
    const parsed = GradeEntrySchema.safeParse({
      studentId: "11111111-1111-1111-1111-111111111111",
      sectionId: "22222222-2222-2222-2222-222222222222",
      assessmentName: "Quiz 1",
      pointsEarned: 18,
      pointsPossible: 20,
      submittedAt: "2026-03-14T12:00:00.000Z"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects impossible max points", () => {
    const parsed = GradeEntrySchema.safeParse({
      studentId: "11111111-1111-1111-1111-111111111111",
      sectionId: "22222222-2222-2222-2222-222222222222",
      assessmentName: "Quiz 1",
      pointsEarned: 18,
      pointsPossible: 0,
      submittedAt: "2026-03-14T12:00:00.000Z"
    });

    expect(parsed.success).toBe(false);
  });
});
