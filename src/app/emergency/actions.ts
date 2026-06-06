"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Record that the user successfully rode out an emergency craving. */
export async function recordGotThroughIt(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase.from("interventions").insert({
    user_id: user.id,
    type: "emergency_mode",
    message: "Completed Emergency Craving Mode and resisted the urge.",
    completed: true,
    helpful: true,
  });
  if (error) return { error: error.message };

  // Also log a resisted craving so it shows up in analytics.
  await supabase.from("cravings").insert({
    user_id: user.id,
    intensity: 9,
    mood: "Anxious",
    stress_level: 8,
    sleep_quality: 5,
    trigger_type: "Stress",
    outcome: "resisted",
    notes: "Got through it via Emergency Craving Mode.",
  });

  revalidatePath("/dashboard");
  revalidatePath("/progress");
  return {};
}

/** Record an emergency relapse: reframed as recoverable progress in the UI. */
export async function recordEmergencyRelapse(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase.from("smoking_events").insert({
    user_id: user.id,
    cigarettes_count: 1,
    trigger_type: "Stress",
    notes: "Logged from Emergency Craving Mode.",
  });
  if (error) return { error: error.message };

  await supabase.from("interventions").insert({
    user_id: user.id,
    type: "emergency_mode",
    message: "Used Emergency Craving Mode; reported smoking.",
    completed: true,
    helpful: false,
  });

  revalidatePath("/dashboard");
  revalidatePath("/progress");
  return {};
}
