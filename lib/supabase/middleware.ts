import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  if (!hasSupabaseEnv()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(items: Array<{ name: string; value: string; options?: unknown }>) {
          items.forEach(({ name, value }) => response.cookies.set(name, value));
        }
      }
    }
  );

  await supabase.auth.getUser();
  return response;
}
