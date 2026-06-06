import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { smokingEventSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** GET /api/smoking-events: list the current user's smoking events. */
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
    .from("smoking_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ smokingEvents: data ?? [] });
}

/** POST /api/smoking-events: record a smoking event (relapse). */
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

  const parsed = smokingEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const v = parsed.data;

  const { data, error } = await supabase
    .from("smoking_events")
    .insert({
      user_id: user.id,
      cigarettes_count: v.cigarettes_count,
      trigger_type: v.trigger_type || null,
      location_label: v.location_label || null,
      notes: v.notes || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ smokingEvent: data }, { status: 201 });
}
