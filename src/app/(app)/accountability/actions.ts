"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { accountabilityContactSchema } from "@/lib/validations";

export async function addContact(raw: unknown): Promise<{ error?: string }> {
  const parsed = accountabilityContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase.from("accountability_contacts").insert({
    user_id: user.id,
    name: v.name,
    email: v.email || null,
    phone: v.phone || null,
    relationship: v.relationship || null,
    notify_on_emergency: v.notify_on_emergency,
  });
  if (error) return { error: error.message };

  revalidatePath("/accountability");
  return {};
}

export async function deleteContact(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase
    .from("accountability_contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/accountability");
  return {};
}

export async function toggleNotify(
  id: string,
  value: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired. Please log in again." };

  const { error } = await supabase
    .from("accountability_contacts")
    .update({ notify_on_emergency: value })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/accountability");
  return {};
}
