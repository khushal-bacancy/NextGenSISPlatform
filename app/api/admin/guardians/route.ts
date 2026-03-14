import { badRequest, ok, serverError } from "@/app/api/_shared";
import { requireAdminContext } from "@/app/api/admin/_auth";
import { createServiceClient } from "@/lib/supabase/service";

type ParentOption = {
  id: string;
  full_name: string | null;
  school_id: string | null;
};

type StudentOption = {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  school_id: string;
};

type GuardianMapping = {
  id: string;
  profile_id: string;
  student_id: string;
  relationship: string;
  created_at: string;
};

function normalizeStudentRow(row: {
  school_id: string;
  students:
    | {
        id: string;
        first_name: string;
        last_name: string;
        student_number: string;
      }
    | Array<{
        id: string;
        first_name: string;
        last_name: string;
        student_number: string;
      }>
    | null;
}): StudentOption | null {
  const student = Array.isArray(row.students) ? row.students[0] : row.students;
  if (!student) {
    return null;
  }
  return {
    id: student.id,
    first_name: student.first_name,
    last_name: student.last_name,
    student_number: student.student_number,
    school_id: row.school_id
  };
}

export async function GET(): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin") {
      return badRequest("Only super_admin or school_admin can manage guardian mappings.");
    }

    const service = createServiceClient();

    let parentsQuery = service
      .from("profiles")
      .select("id, full_name, school_id")
      .eq("role", "parent")
      .order("full_name", { ascending: true })
      .limit(500);

    if (context.role === "school_admin" && context.schoolId) {
      parentsQuery = parentsQuery.eq("school_id", context.schoolId);
    }

    const { data: parents, error: parentError } = await parentsQuery;
    if (parentError) {
      return serverError(parentError.message);
    }

    let studentsQuery = service
      .from("enrollments")
      .select("school_id, students!inner(id, first_name, last_name, student_number)")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (context.role === "school_admin" && context.schoolId) {
      studentsQuery = studentsQuery.eq("school_id", context.schoolId);
    }

    const { data: enrollmentStudents, error: studentsError } = await studentsQuery;
    if (studentsError) {
      return serverError(studentsError.message);
    }

    const students = Array.from(
      new Map(
        (enrollmentStudents ?? [])
          .map((row) => normalizeStudentRow(row as Parameters<typeof normalizeStudentRow>[0]))
          .filter((row): row is StudentOption => Boolean(row))
          .map((row) => [row.id, row])
      ).values()
    );

    const studentIds = students.map((student) => student.id);
    if (studentIds.length === 0) {
      return ok({ parents: (parents as ParentOption[]) ?? [], students: [], mappings: [] });
    }

    const { data: mappings, error: mappingsError } = await service
      .from("guardians")
      .select("id, profile_id, student_id, relationship, created_at")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (mappingsError) {
      return serverError(mappingsError.message);
    }

    return ok({
      parents: (parents as ParentOption[]) ?? [],
      students,
      mappings: (mappings as GuardianMapping[]) ?? []
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin") {
      return badRequest("Only super_admin or school_admin can assign guardian mappings.");
    }

    const body = (await request.json()) as {
      parentProfileId?: string;
      studentId?: string;
      relationship?: string;
    };

    if (!body.parentProfileId || !body.studentId) {
      return badRequest("Missing parentProfileId or studentId.");
    }

    const service = createServiceClient();

    const { data: parentProfile, error: parentError } = await service
      .from("profiles")
      .select("id, role, school_id")
      .eq("id", body.parentProfileId)
      .maybeSingle();

    if (parentError || !parentProfile) {
      return badRequest("Parent profile not found.");
    }
    if (parentProfile.role !== "parent") {
      return badRequest("Selected user is not a parent.");
    }

    const { data: enrollment, error: enrollmentError } = await service
      .from("enrollments")
      .select("student_id, school_id")
      .eq("student_id", body.studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollmentError || !enrollment) {
      return badRequest("Student enrollment not found.");
    }

    if (context.role === "school_admin") {
      if (!context.schoolId || enrollment.school_id !== context.schoolId) {
        return badRequest("school_admin can only map students in their own school.");
      }
      if (parentProfile.school_id !== context.schoolId) {
        return badRequest("school_admin can only map parents in their own school.");
      }
    }

    const relationship = body.relationship?.trim() || "parent";
    const { data, error } = await service
      .from("guardians")
      .upsert(
        {
          profile_id: body.parentProfileId,
          student_id: body.studentId,
          relationship
        },
        { onConflict: "profile_id,student_id" }
      )
      .select("id, profile_id, student_id, relationship, created_at")
      .single();

    if (error) {
      return serverError(error.message);
    }

    return ok(data);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin") {
      return badRequest("Only super_admin or school_admin can remove guardian mappings.");
    }

    const body = (await request.json()) as { mappingId?: string };
    if (!body.mappingId) {
      return badRequest("Missing mappingId.");
    }

    const service = createServiceClient();
    const { data: mapping, error: mappingError } = await service
      .from("guardians")
      .select("id, profile_id, student_id")
      .eq("id", body.mappingId)
      .maybeSingle();

    if (mappingError || !mapping) {
      return badRequest("Mapping not found.");
    }

    if (context.role === "school_admin") {
      const { data: enrollment, error: enrollmentError } = await service
        .from("enrollments")
        .select("school_id")
        .eq("student_id", mapping.student_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollmentError || !enrollment || enrollment.school_id !== context.schoolId) {
        return badRequest("school_admin can only remove mappings for students in their own school.");
      }
    }

    const { error } = await service.from("guardians").delete().eq("id", body.mappingId);
    if (error) {
      return serverError(error.message);
    }

    return ok({ mappingId: body.mappingId });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}
