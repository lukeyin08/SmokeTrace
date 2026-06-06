"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, quitProfileSchema } from "@/lib/validations";

export async function updateProfile(raw: unknown): Promise<{ error?: string; ok?: boolean }> {
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: v.full_name || null,
      username: v.username || null,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateQuitProfile(
  raw: unknown
): Promise<{ error?: string; ok?: boolean }> {
  const parsed = quitProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  // Find the latest quit profile to update; otherwise insert.
  const { data: existing } = await supabase
    .from("user_quit_profiles")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    cigarettes_per_day: v.cigarettes_per_day,
    years_smoking: v.years_smoking,
    cigarette_type: v.cigarette_type || null,
    quit_date: v.quit_date || null,
    quit_goal: v.quit_goal || null,
    cost_per_pack: v.cost_per_pack,
    cigarettes_per_pack: v.cigarettes_per_pack,
    stress_level: v.stress_level,
  };

  const existingId = (existing as { id: string } | null)?.id;

  const { error } = existingId
    ? await supabase
        .from("user_quit_profiles")
        .update(payload)
        .eq("id", existingId)
        .eq("user_id", user.id)
    : await supabase
        .from("user_quit_profiles")
        .insert({ user_id: user.id, ...payload });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  return { ok: true };
}

/**
 * Account deletion placeholder. Fully deleting an auth user requires the
 * service role key on the server; here we wipe the user's data and sign them
 * out. See README for enabling hard auth-user deletion via an edge function.
 */
export async function deleteAccountData(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  // RLS ensures these only affect the current user's rows.
  const tables = [
    "cravings",
    "smoking_events",
    "interventions",
    "trigger_locations",
    "accountability_contacts",
    "coach_messages",
    "achievements",
    "user_quit_profiles",
  ] as const;

  for (const table of tables) {
    await supabase.from(table).delete().eq("user_id", user.id);
  }

  // Reset onboarding so a fresh start is possible if they sign back in.
  await supabase
    .from("profiles")
    .update({ onboarding_completed: false })
    .eq("id", user.id);

  await supabase.auth.signOut();
  return {};
}
