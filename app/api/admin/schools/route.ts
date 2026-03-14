import { badRequest, ok, serverError } from "@/app/api/_shared";
import { requireAdminContext } from "@/app/api/admin/_auth";
import { createServiceClient } from "@/lib/supabase/service";
import { SchoolCreateSchema } from "@/lib/validations/sis";

export async function GET(): Promise<Response> {
  try {
    const context = await requireAdminContext();
    const service = createServiceClient();

    let query = service.from("schools").select("id, name, created_at").order("name", { ascending: true });
    if (context.role === "school_admin" && context.schoolId) {
      query = query.eq("id", context.schoolId);
    } else if (context.role !== "super_admin") {
      return ok([]);
    }

    const { data, error } = await query;
    if (error) {
      return serverError(error.message);
    }

    return ok(data ?? []);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin") {
      return badRequest("Only super_admin can create schools.");
    }

    const body = await request.json();
    const parsed = SchoolCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from("schools")
      .insert({ name: parsed.data.name })
      .select("id, name")
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
    if (context.role !== "super_admin") {
      return badRequest("Only super_admin can delete schools.");
    }

    const body = (await request.json()) as { schoolId?: string };
    if (!body.schoolId) {
      return badRequest("Missing schoolId.");
    }

    const service = createServiceClient();
    const { count: enrollmentCount, error: enrollError } = await service
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("school_id", body.schoolId);
    if (enrollError) {
      return serverError(enrollError.message);
    }
    if ((enrollmentCount ?? 0) > 0) {
      return badRequest("Cannot delete a school with active enrollments. Archive or remove enrollments first.");
    }

    const { error } = await service.from("schools").delete().eq("id", body.schoolId);
    if (error) {
      return serverError(error.message);
    }

    return ok({ schoolId: body.schoolId });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}
