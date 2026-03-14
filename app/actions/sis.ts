"use server";

import { revalidatePath } from "next/cache";

import {
  AttendanceEntrySchema,
  GradeEntrySchema,
  StudentEnrollmentSchema,
  type AttendanceEntryInput,
  type GradeEntryInput,
  type StudentEnrollmentInput
} from "@/lib/validations/sis";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  success: boolean;
  message: string;
};

export async function enrollStudentAction(input: StudentEnrollmentInput): Promise<ActionState> {
  const parsed = StudentEnrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid enrollment data." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("enroll_student", {
    p_first_name: parsed.data.firstName,
    p_last_name: parsed.data.lastName,
    p_student_number: parsed.data.studentNumber,
    p_school_id: parsed.data.schoolId,
    p_grade_level: parsed.data.gradeLevel,
    p_enrollment_date: parsed.data.enrollmentDate
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/enrollment");
  return { success: true, message: "Student enrolled." };
}

export async function recordAttendanceAction(input: AttendanceEntryInput): Promise<ActionState> {
  const parsed = AttendanceEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid attendance data." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("attendance_records").insert({
    student_id: parsed.data.studentId,
    section_id: parsed.data.sectionId,
    attendance_date: parsed.data.attendanceDate,
    status: parsed.data.status,
    note: parsed.data.note ?? null
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/attendance");
  return { success: true, message: "Attendance recorded." };
}

export async function recordGradeAction(input: GradeEntryInput): Promise<ActionState> {
  const parsed = GradeEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid grade data." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("grade_entries").insert({
    student_id: parsed.data.studentId,
    section_id: parsed.data.sectionId,
    assessment_name: parsed.data.assessmentName,
    points_earned: parsed.data.pointsEarned,
    points_possible: parsed.data.pointsPossible,
    submitted_at: parsed.data.submittedAt
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/grades");
  return { success: true, message: "Grade submitted." };
}
