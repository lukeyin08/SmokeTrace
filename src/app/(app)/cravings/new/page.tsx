import type { Metadata } from "next";
import { requireUser } from "@/lib/supabase/queries";
import { CravingForm } from "@/components/craving-form";
import type { TriggerLocation } from "@/lib/types";

export const metadata: Metadata = { title: "Log craving" };

export default async function NewCravingPage() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("trigger_locations")
    .select("name")
    .eq("user_id", user.id);

  const suggestions = ((data ?? []) as Pick<TriggerLocation, "name">[])
    .map((l) => l.name)
    .filter((n): n is string => Boolean(n));

  return (
    <div className="mx-auto max-w-2xl">
      <CravingForm locationSuggestions={suggestions} />
    </div>
  );
}
