"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteTriggerLocation } from "@/app/(app)/triggers/actions";

// Leaflet needs the browser, so load the map client-side only.
const TriggerMap = dynamic(() => import("@/components/trigger-map"), {
  ssr: false,
  loading: () => (
    <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
  ),
});
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TriggerLocation } from "@/lib/types";

function riskMeta(level: number): {
  label: string;
  variant: "success" | "warning" | "destructive";
} {
  if (level >= 8) return { label: "High risk", variant: "destructive" };
  if (level >= 5) return { label: "Moderate", variant: "warning" };
  return { label: "Lower risk", variant: "success" };
}

export function TriggerLocationCard({ location }: { location: TriggerLocation }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const meta = riskMeta(location.risk_level);

  async function onDelete() {
    setDeleting(true);
    const res = await deleteTriggerLocation(location.id);
    if (res.error) {
      toast.error(res.error);
      setDeleting(false);
    } else {
      toast.success("Location removed.");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">{location.name}</p>
              {location.address && (
                <p className="truncate text-sm text-muted-foreground">
                  {location.address}
                </p>
              )}
              {location.notes && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {location.notes}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={deleting}
            aria-label="Delete location"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Interactive map when coordinates exist, otherwise a hint */}
        {location.latitude != null && location.longitude != null ? (
          <div className="mt-3 h-32 w-full overflow-hidden rounded-xl border">
            <TriggerMap
              latitude={location.latitude}
              longitude={location.longitude}
              name={location.name}
              radiusMeters={location.radius_meters}
            />
          </div>
        ) : (
          <div className="relative mt-3 flex h-24 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-teal-400/10">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative flex flex-col items-center text-center text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xs">Add coordinates to see the map</span>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <Badge variant={meta.variant}>
            {meta.label} · {location.risk_level}/10
          </Badge>
          <span className="text-xs text-muted-foreground">
            {location.radius_meters}m radius
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
