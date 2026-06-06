import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateRiskScore } from "@/lib/risk/calculateRiskScore";
import { computeCurrentRisk } from "@/lib/risk/currentRisk";
import type { Craving, SmokingEvent, QuitProfile } from "@/lib/types";

export const runtime = "nodejs";

const inputSchema = z.object({
  hourOfDay: z.number().int().min(0).max(23).optional(),
  cravingIntensity: z.number().min(0).max(10).nullable().optional(),
  stressLevel: z.number().min(0).max(10).nullable().optional(),
  sleepQuality: z.number().min(0).max(10).nullable().optional(),
  recentCravings24h: z.number().int().min(0).optional(),
  recentSmokingEvents72h: z.number().int().min(0).optional(),
  triggerType: z.string().nullable().optional(),
  locationRisk: z.number().min(0).max(10).nullable().optional(),
  daysSinceQuit: z.number().int().nullable().optional(),
});

/**
 * POST /api/risk-score
 * - With a JSON body matching RiskScoreInput: scores that exact input.
 * - With an empty body: computes the user's *current* risk from recent data.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // If the caller provided meaningful inputs, score those directly.
  const hasInputs = Object.keys(parsed.data).length > 0;
  if (hasInputs) {
    return NextResponse.json(calculateRiskScore(parsed.data));
  }

  // Otherwise derive current risk from the user's recent activity.
  const [{ data: cravings }, { data: smoking }, { data: quit }] =
    await Promise.all([
      supabase
        .from("cravings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("smoking_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("user_quit_profiles")
        .select("quit_date, stress_level")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const result = computeCurrentRisk(
    (cravings ?? []) as Craving[],
    (smoking ?? []) as SmokingEvent[],
    (quit as Pick<QuitProfile, "quit_date" | "stress_level"> | null) ?? null
  );

  return NextResponse.json(result);
}
