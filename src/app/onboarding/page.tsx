import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/queries";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) redirect("/dashboard");

  const firstName = profile?.full_name?.split(" ")[0] || "";

  return <OnboardingFlow firstName={firstName} />;
}
