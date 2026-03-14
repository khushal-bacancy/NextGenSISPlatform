import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";
import { StorageUploadUrlSchema } from "@/lib/validations/sis";

const ALLOWED_PREFIXES = ["registrations/", "enrollments/"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = StorageUploadUrlSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const rawPath = parsed.data.path.trim().replace(/^\/+/, "");
  if (rawPath.includes("..") || !ALLOWED_PREFIXES.some((prefix) => rawPath.startsWith(prefix))) {
    return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
  }

  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "next-gen-sis";

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(rawPath);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message ?? "Failed to create upload URL." }, { status: 400 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl, path: data.path, bucket });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload service not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
