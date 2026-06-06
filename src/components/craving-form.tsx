"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Cigarette,
  HeartHandshake,
  LineChart,
} from "lucide-react";

import { cravingSchema, type CravingValues } from "@/lib/validations";
import { MOOD_OPTIONS, TRIGGER_OPTIONS } from "@/lib/constants";
import { logCraving, type LogCravingResult } from "@/app/(app)/cravings/actions";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { RiskScoreCard } from "@/components/risk-score-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OUTCOMES: { value: CravingValues["outcome"]; label: string; hint: string }[] =
  [
    {
      value: "resisted",
      label: "I resisted",
      hint: "You got through it 💪",
    },
    {
      value: "still_craving",
      label: "Still craving",
      hint: "Riding it out",
    },
    { value: "smoked", label: "I smoked", hint: "That's okay" },
  ];

export function CravingForm({
  locationSuggestions = [],
}: {
  locationSuggestions?: string[];
}) {
  const router = useRouter();
  const [result, setResult] = React.useState<LogCravingResult | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<CravingValues>({
    resolver: zodResolver(cravingSchema),
    defaultValues: {
      intensity: 5,
      mood: "",
      stress_level: 5,
      sleep_quality: 5,
      trigger_type: "",
      location_label: "",
      notes: "",
      outcome: "still_craving",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const values = watch();

  async function onSubmit(data: CravingValues) {
    setSubmitting(true);
    const res = await logCraving(data);
    setSubmitting(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setResult(res);
    if (data.outcome === "resisted") {
      toast.success("Logged. Proud of you for getting through it.");
    } else {
      toast.success("Craving logged.");
    }
  }

  // ----- Result screen -----
  if (result?.risk) {
    const smoked = values.outcome === "smoked";
    return (
      <div className="space-y-5">
        {smoked ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-5">
              <HeartHandshake className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">This is recoverable progress.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A slip isn't a failure, it's information. You logged it
                  honestly, and that's how you learn your patterns. Your streak
                  resets, but everything you've built doesn't. Let's get the next
                  moment right.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="flex items-start gap-3 p-5">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
              <div>
                <p className="font-semibold">Craving logged.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Here's your relapse risk right now, with a recommended next
                  step. Cravings peak and pass, and you've got this.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <RiskScoreCard result={result.risk} />

        <div className="flex flex-wrap gap-2">
          {(result.risk.level === "high" || result.risk.level === "critical") && (
            <Button asChild variant="destructive">
              <Link href="/emergency">
                <AlertTriangle className="h-4 w-4" /> Emergency mode
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/progress">
              <LineChart className="h-4 w-4" /> View progress
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setResult(null);
              form.reset();
            }}
          >
            Log another
          </Button>
        </div>
      </div>
    );
  }

  // ----- Form -----
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a craving</CardTitle>
        <CardDescription>
          A quick check-in. Honest answers make your predictions smarter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Field
            label={`Craving intensity: ${values.intensity}/10`}
            error={errors.intensity?.message}
          >
            <Slider
              min={1}
              max={10}
              step={1}
              value={[values.intensity]}
              onValueChange={(v) =>
                setValue("intensity", v[0], { shouldValidate: true })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mild</span>
              <span>Overwhelming</span>
            </div>
          </Field>

          <Field label="How are you feeling?" error={errors.mood?.message}>
            <Select
              value={values.mood}
              onValueChange={(v) =>
                setValue("mood", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a mood" />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label={`Stress: ${values.stress_level}/10`}
              error={errors.stress_level?.message}
            >
              <Slider
                min={1}
                max={10}
                step={1}
                value={[values.stress_level]}
                onValueChange={(v) =>
                  setValue("stress_level", v[0], { shouldValidate: true })
                }
              />
            </Field>
            <Field
              label={`Sleep quality: ${values.sleep_quality}/10`}
              error={errors.sleep_quality?.message}
            >
              <Slider
                min={1}
                max={10}
                step={1}
                value={[values.sleep_quality]}
                onValueChange={(v) =>
                  setValue("sleep_quality", v[0], { shouldValidate: true })
                }
              />
            </Field>
          </div>

          <Field label="What triggered it?" error={errors.trigger_type?.message}>
            <Select
              value={values.trigger_type}
              onValueChange={(v) => setValue("trigger_type", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger (optional)" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Where are you?" htmlFor="location_label">
            <Input
              id="location_label"
              list="location-suggestions"
              placeholder="e.g. Home, work, car (optional)"
              {...register("location_label")}
            />
            {locationSuggestions.length > 0 && (
              <datalist id="location-suggestions">
                {locationSuggestions.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            )}
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea
              id="notes"
              rows={2}
              placeholder="Anything you want to remember about this moment…"
              {...register("notes")}
            />
          </Field>

          <Field label="What happened?">
            <div className="grid grid-cols-3 gap-2">
              {OUTCOMES.map((o) => {
                const active = values.outcome === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setValue("outcome", o.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-3 text-center text-sm transition-colors",
                      active
                        ? o.value === "smoked"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {o.value === "smoked" ? (
                      <Cigarette className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                    <span className="font-medium">{o.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {o.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? <Spinner /> : null}
            {submitting ? "Saving…" : "Log craving & see my risk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
