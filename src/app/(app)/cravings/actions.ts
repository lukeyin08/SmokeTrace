"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cravingSchema, smokingEventSchema } from "@/lib/validations";
import { computeCurrentRisk } from "@/lib/risk/currentRisk";
import { countRecent, daysSinceQuit } from "@/lib/calculations";
import { calculateRiskScore } from "@/lib/risk/calculateRiskScore";
import type { Craving, SmokingEvent, QuitProfile, RiskScoreResult } from "@/lib/types";

export interface LogCravingResult {
  error?: string;
  risk?: RiskScoreResult;
  cravingId?: string;
  interventionId?: string;
}

export async function logCraving(raw: unknown): Promise<LogCravingResult> {
  const parsed = cravingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid craving data." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  // Insert the craving.
  const { data: inserted, error: insertError } = await supabase
    .from("cravings")
    .insert({
      user_id: user.id,
      intensity: v.intensity,
      mood: v.mood,
      stress_level: v.stress_level,
      sleep_quality: v.sleep_quality,
      trigger_type: v.trigger_type || null,
      location_label: v.location_label || null,
      notes: v.notes || null,
      outcome: v.outcome,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };
  const cravingId = (inserted as { id: string } | null)?.id;

  // Pull recent context to score risk.
  const now = new Date();
  const [{ data: recentCravings }, { data: recentSmoking }, { data: quit }] =
    await Promise.all([
      supabase
        .from("cravings")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(now.getTime() - 24 * 3600 * 1000).toISOString()),
      supabase
        .from("smoking_events")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(now.getTime() - 72 * 3600 * 1000).toISOString()),
      supabase
        .from("user_quit_profiles")
        .select("quit_date, stress_level")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const quitProfile = (quit as Pick<QuitProfile, "quit_date" | "stress_level"> | null) ?? null;

  const risk = calculateRiskScore({
    hourOfDay: now.getHours(),
    cravingIntensity: v.intensity,
    stressLevel: v.stress_level,
    sleepQuality: v.sleep_quality,
    recentCravings24h: countRecent(
      (recentCravings ?? []) as Pick<Craving, "created_at">[],
      24,
      now
    ),
    recentSmokingEvents72h: countRecent(
      (recentSmoking ?? []) as Pick<SmokingEvent, "created_at">[],
      72,
      now
    ),
    triggerType: v.trigger_type || null,
    daysSinceQuit: daysSinceQuit(quitProfile?.quit_date, now),
  });

  // Persist the recommended intervention.
  const { data: interv } = await supabase
    .from("interventions")
    .insert({
      user_id: user.id,
      craving_id: cravingId ?? null,
      type: risk.recommendation.type,
      message: risk.recommendation.message,
      completed: v.outcome === "resisted",
      helpful: v.outcome === "resisted" ? true : null,
    })
    .select("id")
    .single();

  // If the user reported they smoked, also record a smoking event.
  if (v.outcome === "smoked") {
    await supabase.from("smoking_events").insert({
      user_id: user.id,
      cigarettes_count: 1,
      trigger_type: v.trigger_type || null,
      location_label: v.location_label || null,
      notes: v.notes || null,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/progress");

  return {
    risk,
    cravingId,
    interventionId: (interv as { id: string } | null)?.id,
  };
}

/** Record a smoking event (relapse): framed as recoverable progress in the UI. */
export async function logSmokingEvent(raw: unknown): Promise<{ error?: string }> {
  const parsed = smokingEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase.from("smoking_events").insert({
    user_id: user.id,
    cigarettes_count: v.cigarettes_count,
    trigger_type: v.trigger_type || null,
    location_label: v.location_label || null,
    notes: v.notes || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/progress");
  return {};
}
