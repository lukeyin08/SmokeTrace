"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { triggerLocationSchema } from "@/lib/validations";

export async function addTriggerLocation(
  raw: unknown
): Promise<{ error?: string }> {
  const parsed = triggerLocationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase.from("trigger_locations").insert({
    user_id: user.id,
    name: v.name,
    address: v.address || null,
    latitude: v.latitude ?? null,
    longitude: v.longitude ?? null,
    radius_meters: v.radius_meters,
    risk_level: v.risk_level,
    notes: v.notes || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/triggers");
  return {};
}

export async function deleteTriggerLocation(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase
    .from("trigger_locations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/triggers");
  return {};
}
