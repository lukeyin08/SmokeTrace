import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cravingSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** GET /api/cravings: list the current user's cravings (most recent first). */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 500);

  const { data, error } = await supabase
    .from("cravings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ cravings: data ?? [] });
}

/** POST /api/cravings: create a craving. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cravingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid craving", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const v = parsed.data;

  const { data, error } = await supabase
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
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ craving: data }, { status: 201 });
}
