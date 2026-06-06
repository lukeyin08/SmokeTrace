import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/queries";
import { EmergencyMode } from "@/components/emergency-mode";
import type { AccountabilityContact, QuitProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Emergency Craving Mode" };

export default async function EmergencyPage() {
  const { supabase, user } = await requireUser();

  const [{ data: contactsData }, { data: quit }] = await Promise.all([
    supabase
      .from("accountability_contacts")
      .select("name, phone, email")
      .eq("user_id", user.id)
      .order("notify_on_emergency", { ascending: false }),
    supabase
      .from("user_quit_profiles")
      .select("quit_goal")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const contacts = (contactsData ?? []) as Pick<
    AccountabilityContact,
    "name" | "phone" | "email"
  >[];
  const quitReason = (quit as Pick<QuitProfile, "quit_goal"> | null)?.quit_goal;

  return (
    <div className="min-h-screen bg-app-gradient">
      <EmergencyMode contacts={contacts} quitReason={quitReason} />
    </div>
  );
}
