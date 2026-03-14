import { badRequest, ok, serverError } from "@/app/api/_shared";
import { requireAdminContext } from "@/app/api/admin/_auth";
import { createServiceClient } from "@/lib/supabase/service";
import { randomBytes } from "crypto";

type RegistrationAction = "approve" | "reject";

export async function GET(): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin" && context.role !== "staff") {
      return badRequest("Unauthorized");
    }

    const service = createServiceClient();
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "next-gen-sis";
    const { data: requests, error } = await service
      .from("registration_requests")
      .select("id, first_name, last_name, email, phone, school_id, grade_level, status, notes, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      return serverError(error.message);
    }

    const requestIds = (requests ?? []).map((req) => req.id);
    const { data: docs, error: docsError } = await service
      .from("registration_documents")
      .select("id, request_id, document_type, original_file_name, file_path")
      .in("request_id", requestIds.length ? requestIds : ["00000000-0000-0000-0000-000000000000"]);

    if (docsError) {
      return serverError(docsError.message);
    }

    const signedDocs = await Promise.all(
      (docs ?? []).map(async (doc) => {
        const { data: signed } = await service.storage.from(bucket).createSignedUrl(doc.file_path, 600);
        return {
          id: doc.id,
          request_id: doc.request_id,
          document_type: doc.document_type,
          original_file_name: doc.original_file_name,
          file_path: doc.file_path,
          signed_url: signed?.signedUrl ?? null
        };
      })
    );

    const docsByRequest = new Map<string, typeof signedDocs>();
    for (const doc of signedDocs) {
      const existing = docsByRequest.get(doc.request_id) ?? [];
      existing.push(doc);
      docsByRequest.set(doc.request_id, existing);
    }

    return ok(
      (requests ?? []).map((req) => ({
        ...req,
        documentsCount: docsByRequest.get(req.id)?.length ?? 0,
        documents: docsByRequest.get(req.id) ?? []
      }))
    );
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin" && context.role !== "staff") {
      return badRequest("Unauthorized");
    }

    const body = (await request.json()) as {
      requestId?: string;
      action?: RegistrationAction;
      notes?: string;
      schoolId?: string;
      gradeLevel?: number;
    };

    if (!body.requestId || (body.action !== "approve" && body.action !== "reject")) {
      return badRequest("Invalid request.");
    }

    const service = createServiceClient();
    const { data: requestRow, error: fetchError } = await service
      .from("registration_requests")
      .select("id, first_name, last_name, email, school_id, grade_level, status")
      .eq("id", body.requestId)
      .maybeSingle();

    if (fetchError || !requestRow) {
      return serverError(fetchError?.message ?? "Registration request not found.");
    }

    if (requestRow.status !== "pending") {
      return badRequest("Request already processed.");
    }

    if (body.action === "reject") {
      const { error: rejectError } = await service
        .from("registration_requests")
        .update({ status: "rejected", notes: body.notes ?? null })
        .eq("id", body.requestId);

      if (rejectError) {
        return serverError(rejectError.message);
      }

      return ok({ status: "rejected" });
    }

    const resolvedSchoolId = body.schoolId ?? requestRow.school_id;
    const resolvedGradeLevel = body.gradeLevel ?? requestRow.grade_level;

    if (!resolvedSchoolId || !resolvedGradeLevel) {
      return badRequest("Cannot approve without school and grade assignment.");
    }

    const studentNumber = `REG-${requestRow.id.slice(0, 8).toUpperCase()}`;
    const { data: enrollmentId, error: enrollError } = await service.rpc("enroll_student", {
      p_first_name: requestRow.first_name,
      p_last_name: requestRow.last_name,
      p_student_number: studentNumber,
      p_school_id: resolvedSchoolId,
      p_grade_level: resolvedGradeLevel,
      p_enrollment_date: new Date().toISOString().slice(0, 10)
    });

    if (enrollError) {
      return serverError(enrollError.message);
    }

    const { data: enrollmentRow, error: enrollmentError } = await service
      .from("enrollments")
      .select("id, student_id")
      .eq("id", enrollmentId as string)
      .maybeSingle();

    if (enrollmentError || !enrollmentRow) {
      return serverError(enrollmentError?.message ?? "Enrollment lookup failed.");
    }

    const { data: docs } = await service
      .from("registration_documents")
      .select("document_type, file_path, original_file_name")
      .eq("request_id", requestRow.id);

    if (docs && docs.length > 0) {
      const { error: docInsertError } = await service.from("student_documents").insert(
        docs.map((doc) => ({
          student_id: enrollmentRow.student_id,
          document_type: doc.document_type,
          file_path: doc.file_path,
          original_file_name: doc.original_file_name,
          status: "pending"
        }))
      );

      if (docInsertError) {
        return serverError(docInsertError.message);
      }
    }

    const { error: verifyError } = await service.from("enrollment_verifications").insert({
      enrollment_id: enrollmentRow.id,
      status: "approved",
      notes: body.notes ?? null,
      verified_by: context.userId,
      verified_at: new Date().toISOString()
    });

    if (verifyError) {
      return serverError(verifyError.message);
    }

    const { error: updateError } = await service
      .from("registration_requests")
      .update({
        status: "approved",
        notes: body.notes ?? null,
        school_id: resolvedSchoolId,
        grade_level: resolvedGradeLevel
      })
      .eq("id", body.requestId);

    if (updateError) {
      return serverError(updateError.message);
    }

    let tempPassword: string | null = null;
    let loginEmail: string | null = requestRow.email ?? null;

    if (requestRow.email) {
      const generatedPassword = `Tmp-${randomBytes(6).toString("hex")}`;
      const { data: userData, error: userError } = await service.auth.admin.createUser({
        email: requestRow.email,
        password: generatedPassword,
        email_confirm: true
      });

      if (userError) {
        const { data: existingUsers } = await service.auth.admin.listUsers({ perPage: 1000 });
        const existingUser = existingUsers?.users?.find(
          (user) => user.email?.toLowerCase() === requestRow.email?.toLowerCase()
        );
        if (existingUser) {
          loginEmail = existingUser.email ?? requestRow.email;
          const { error: profileError } = await service.from("profiles").upsert({
            id: existingUser.id,
            full_name: `${requestRow.first_name} ${requestRow.last_name}`,
            role: "student",
            school_id: resolvedSchoolId,
            student_id: enrollmentRow.student_id
          });
          if (profileError) {
            return serverError(profileError.message);
          }
        }
      } else if (userData?.user) {
        tempPassword = generatedPassword;
        loginEmail = userData.user.email ?? requestRow.email;
        const { error: profileError } = await service.from("profiles").upsert({
          id: userData.user.id,
          full_name: `${requestRow.first_name} ${requestRow.last_name}`,
          role: "student",
          school_id: resolvedSchoolId,
          student_id: enrollmentRow.student_id
        });
        if (profileError) {
          return serverError(profileError.message);
        }
      }
    }

    return ok({ status: "approved", enrollmentId, tempPassword, loginEmail });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}
