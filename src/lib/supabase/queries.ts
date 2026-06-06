import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, QuitProfile } from "@/lib/types";

/**
 * Require an authenticated user in a Server Component / Route Handler.
 * Redirects to /login if not signed in.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Load the current user's profile + quit profile together. */
export async function getProfileBundle() {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: quitProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_quit_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    supabase,
    user,
    profile: (profile as Profile | null) ?? null,
    quitProfile: (quitProfile as QuitProfile | null) ?? null,
  };
}
