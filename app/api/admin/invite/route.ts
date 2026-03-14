import { randomUUID } from "node:crypto";

import { badRequest, ok, serverError } from "@/app/api/_shared";
import { requireAdminContext } from "@/app/api/admin/_auth";
import { createServiceClient } from "@/lib/supabase/service";
import { UserInviteSchema } from "@/lib/validations/sis";

export async function POST(request: Request): Promise<Response> {
  try {
    const context = await requireAdminContext();
    if (context.role !== "super_admin" && context.role !== "school_admin") {
      return badRequest("Only super_admin or school_admin can invite users.");
    }

    const body = await request.json();
    const parsed = UserInviteSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    if (context.role === "school_admin" && context.schoolId !== parsed.data.schoolId) {
      return badRequest("school_admin can only invite users into their own school.");
    }

    const service = createServiceClient();

    const temporaryPassword = `TempPass!${randomUUID().slice(0, 8)}`;

    const { data: invitedUser, error: inviteError } = await service.auth.admin.createUser({
      email: parsed.data.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName,
        role: parsed.data.role
      }
    });

    if (inviteError || !invitedUser.user) {
      return serverError(inviteError?.message ?? "Failed to create user.");
    }

    const { error: profileError } = await service.from("profiles").upsert(
      {
        id: invitedUser.user.id,
        full_name: parsed.data.fullName,
        role: parsed.data.role,
        school_id: parsed.data.schoolId
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return serverError(profileError.message);
    }

    return ok({
      userId: invitedUser.user.id,
      email: parsed.data.email,
      role: parsed.data.role,
      schoolId: parsed.data.schoolId,
      temporaryPassword
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unauthorized");
  }
}
