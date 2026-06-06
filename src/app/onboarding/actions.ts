"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations";

export interface OnboardingResult {
  error?: string;
}

export async function completeOnboarding(
  raw: unknown
): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please review your answers and try again.",
    };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  // 1. Save the quit profile.
  const { error: quitError } = await supabase.from("user_quit_profiles").insert({
    user_id: user.id,
    smoking_frequency: v.smoking_frequency,
    cigarettes_per_day: v.cigarettes_per_day,
    years_smoking: v.years_smoking,
    cigarette_type: v.cigarette_type,
    quit_goal: v.quit_goal,
    quit_date: v.quit_date,
    stress_level: v.stress_level,
    common_triggers: v.common_triggers,
    previous_quit_attempts: v.previous_quit_attempts,
    cost_per_pack: v.cost_per_pack,
    cigarettes_per_pack: v.cigarettes_per_pack,
  });
  if (quitError) return { error: quitError.message };

  // 2. Optional accountability contact.
  if (v.contact_name && (v.contact_email || v.contact_relationship)) {
    await supabase.from("accountability_contacts").insert({
      user_id: user.id,
      name: v.contact_name,
      email: v.contact_email || null,
      relationship: v.contact_relationship || null,
      notify_on_emergency: false,
    });
  }

  // 3. Seed a first achievement.
  await supabase.from("achievements").insert({
    user_id: user.id,
    achievement_key: "onboarding_complete",
    title: "Journey begun",
    description: "You created your personalized quit profile.",
  });

  // 4. Mark onboarding complete.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  redirect("/dashboard");
}
