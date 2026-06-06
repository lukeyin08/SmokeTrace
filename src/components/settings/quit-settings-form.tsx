"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { quitProfileSchema } from "@/lib/validations";
import { updateQuitProfile } from "@/app/(app)/settings/actions";
import { CIGARETTE_TYPE_OPTIONS, QUIT_GOAL_OPTIONS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuitProfile } from "@/lib/types";

type Values = z.infer<typeof quitProfileSchema>;

export function QuitSettingsForm({
  quitProfile,
}: {
  quitProfile: QuitProfile | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(quitProfileSchema),
    defaultValues: {
      cigarettes_per_day: quitProfile?.cigarettes_per_day ?? 10,
      years_smoking: quitProfile?.years_smoking ?? 5,
      cigarette_type: quitProfile?.cigarette_type ?? "",
      quit_date: quitProfile?.quit_date ?? "",
      quit_goal: quitProfile?.quit_goal ?? "",
      cost_per_pack: quitProfile?.cost_per_pack ?? 8,
      cigarettes_per_pack: quitProfile?.cigarettes_per_pack ?? 20,
      stress_level: quitProfile?.stress_level ?? 5,
    },
  });

  const values = watch();

  async function onSubmit(data: Values) {
    setSaving(true);
    const res = await updateQuitProfile(data);
    setSaving(false);
    if (res.error) return toast.error(res.error);
    toast.success("Quit profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Cigarettes per day"
          htmlFor="q-cpd"
          error={errors.cigarettes_per_day?.message}
        >
          <Input
            id="q-cpd"
            type="number"
            min={0}
            {...register("cigarettes_per_day")}
          />
        </Field>
        <Field
          label="Years smoking"
          htmlFor="q-years"
          error={errors.years_smoking?.message}
        >
          <Input
            id="q-years"
            type="number"
            min={0}
            {...register("years_smoking")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cigarette type">
          <Select
            value={values.cigarette_type}
            onValueChange={(v) => setValue("cigarette_type", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {CIGARETTE_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Goal">
          <Select
            value={values.quit_goal}
            onValueChange={(v) => setValue("quit_goal", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a goal" />
            </SelectTrigger>
            <SelectContent>
              {QUIT_GOAL_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Quit date" htmlFor="q-date">
        <Input id="q-date" type="date" {...register("quit_date")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Cost per pack ($)"
          htmlFor="q-cost"
          error={errors.cost_per_pack?.message}
        >
          <Input
            id="q-cost"
            type="number"
            step="0.01"
            min={0}
            {...register("cost_per_pack")}
          />
        </Field>
        <Field
          label="Cigarettes per pack"
          htmlFor="q-cpp"
          error={errors.cigarettes_per_pack?.message}
        >
          <Input
            id="q-cpp"
            type="number"
            min={1}
            {...register("cigarettes_per_pack")}
          />
        </Field>
      </div>

      <Field label={`Typical stress level: ${values.stress_level}/10`}>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[values.stress_level]}
          onValueChange={(v) => setValue("stress_level", v[0])}
        />
      </Field>

      <Button type="submit" disabled={saving}>
        {saving ? <Spinner /> : null}
        {saving ? "Saving…" : "Save quit profile"}
      </Button>
    </form>
  );
}
