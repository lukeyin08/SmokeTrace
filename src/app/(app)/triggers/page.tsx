import type { Metadata } from "next";
import { MapPin, Info } from "lucide-react";

import { requireUser } from "@/lib/supabase/queries";
import type { TriggerLocation } from "@/lib/types";

import { TriggerLocationCard } from "@/components/trigger-location-card";
import { AddTriggerDialog } from "@/components/add-trigger-dialog";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Trigger locations" };

export default async function TriggersPage() {
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from("trigger_locations")
    .select("*")
    .eq("user_id", user.id)
    .order("risk_level", { ascending: false });

  const locations = (data ?? []) as TriggerLocation[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Trigger locations
          </h1>
          <p className="text-sm text-muted-foreground">
            The places where cravings hit hardest, so you can plan around them.
          </p>
        </div>
        <AddTriggerDialog />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Mobile geofencing can come later through a companion app. For now,
            this is a personal map of your high-risk places. Review it before
            heading into a tough situation.
          </p>
        </CardContent>
      </Card>

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No trigger locations yet"
          description="Add the bars, smoke spots, or stressful places where cravings tend to strike."
          action={<AddTriggerDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {locations.map((loc) => (
            <TriggerLocationCard key={loc.id} location={loc} />
          ))}
        </div>
      )}
    </div>
  );
}
