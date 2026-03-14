import { badRequest, ok, serverError } from "@/app/api/_shared";
import { requireAdminContext } from "@/app/api/admin/_auth";
import { createServiceClient } from "@/lib/supabase/service";

type AdminUser = {
  id: string;
  full_name: string | null;
  role: string;
  school_id: string | null;
  student_id: string | null;
  email: string | null;
  created_at: string;
};

export async function GET(): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin") {
      return badRequest("Only super_admin or school_admin can view users.");
    }

    const service = createServiceClient();
    let profilesQuery = service
      .from("profiles")
      .select("id, full_name, role, school_id, student_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (context.role === "school_admin" && context.schoolId) {
      profilesQuery = profilesQuery.eq("school_id", context.schoolId).neq("role", "super_admin");
    }

    const { data: profiles, error: profileError } = await profilesQuery;
    if (profileError) {
      return serverError(profileError.message);
    }

    const { data: usersPage, error: userError } = await service.auth.admin.listUsers({ perPage: 200 });
    if (userError) {
      return serverError(userError.message);
    }

    const emailById = new Map<string, string>();
    for (const user of usersPage?.users ?? []) {
      if (user.email) {
        emailById.set(user.id, user.email);
      }
    }

    const response: AdminUser[] = (profiles ?? []).map((profile) => ({
      ...profile,
      email: emailById.get(profile.id) ?? null
    }));

    return ok(response);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin") {
      return badRequest("Only super_admin or school_admin can delete users.");
    }

    const body = (await request.json()) as { userId?: string };
    if (!body.userId) {
      return badRequest("Missing userId.");
    }

    if (body.userId === context.userId) {
      return badRequest("You cannot delete your own account.");
    }

    const service = createServiceClient();
    const { data: targetProfile, error: profileError } = await service
      .from("profiles")
      .select("id, role, school_id")
      .eq("id", body.userId)
      .maybeSingle();

    if (profileError || !targetProfile) {
      return serverError(profileError?.message ?? "User not found.");
    }

    if (context.role === "school_admin") {
      if (targetProfile.role === "super_admin" || targetProfile.role === "school_admin") {
        return badRequest("school_admin can only delete staff, teachers, parents, or students.");
      }
      if (context.schoolId && targetProfile.school_id !== context.schoolId) {
        return badRequest("school_admin can only delete users in their school.");
      }
    }

    if (context.role === "super_admin" && targetProfile.role === "super_admin") {
      return badRequest("super_admin cannot delete another super_admin.");
    }

    const { error: deleteError } = await service.auth.admin.deleteUser(body.userId);
    if (deleteError) {
      return serverError(deleteError.message);
    }

    return ok({ userId: body.userId });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}
