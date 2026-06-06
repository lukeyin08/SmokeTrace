"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Crosshair, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  triggerLocationSchema,
  type TriggerLocationValues,
} from "@/lib/validations";
import { addTriggerLocation } from "@/app/(app)/triggers/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddTriggerDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TriggerLocationValues>({
    resolver: zodResolver(triggerLocationSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: null,
      longitude: null,
      radius_meters: 100,
      risk_level: 5,
      notes: "",
    },
  });

  const riskLevel = watch("risk_level");
  const [locating, setLocating] = React.useState(false);

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", Number(pos.coords.latitude.toFixed(6)));
        setValue("longitude", Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
        toast.success("Current location captured.");
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get your location. Enter it manually instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function onSubmit(data: TriggerLocationValues) {
    setSubmitting(true);
    const res = await addTriggerLocation(data);
    setSubmitting(false);
    if (res.error) return toast.error(res.error);
    toast.success("Trigger location added.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a trigger location</DialogTitle>
          <DialogDescription>
            Track places where cravings tend to hit, so you can plan ahead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" htmlFor="t-name" error={errors.name?.message}>
            <Input
              id="t-name"
              placeholder="e.g. The bar near work"
              {...register("name")}
            />
          </Field>
          <Field label="Address" htmlFor="t-address">
            <Input
              id="t-address"
              placeholder="Optional"
              {...register("address")}
            />
          </Field>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useMyLocation}
            disabled={locating}
          >
            {locating ? <Spinner /> : <Crosshair className="h-4 w-4" />}
            {locating ? "Locating…" : "Use my current location"}
          </Button>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Latitude"
              htmlFor="t-lat"
              error={errors.latitude?.message}
            >
              <Input
                id="t-lat"
                type="number"
                step="any"
                placeholder="Optional"
                {...register("latitude")}
              />
            </Field>
            <Field
              label="Longitude"
              htmlFor="t-lng"
              error={errors.longitude?.message}
            >
              <Input
                id="t-lng"
                type="number"
                step="any"
                placeholder="Optional"
                {...register("longitude")}
              />
            </Field>
          </div>
          <Field label={`Risk level: ${riskLevel}/10`}>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[riskLevel]}
              onValueChange={(v) => setValue("risk_level", v[0])}
            />
          </Field>
          <Field
            label="Radius (meters)"
            htmlFor="t-radius"
            error={errors.radius_meters?.message}
          >
            <Input
              id="t-radius"
              type="number"
              min={10}
              {...register("radius_meters")}
            />
          </Field>
          <Field label="Notes" htmlFor="t-notes">
            <Textarea
              id="t-notes"
              rows={2}
              placeholder="What makes this place risky?"
              {...register("notes")}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {submitting ? "Saving…" : "Save location"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
