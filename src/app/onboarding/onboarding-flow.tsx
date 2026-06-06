"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Cigarette,
  Target,
  Zap,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { onboardingSchema, type OnboardingValues } from "@/lib/validations";
import {
  CIGARETTE_TYPE_OPTIONS,
  QUIT_GOAL_OPTIONS,
  SMOKING_FREQUENCY_OPTIONS,
  TRIGGER_OPTIONS,
  DISCLAIMER_TEXT,
} from "@/lib/constants";
import { completeOnboarding } from "./actions";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
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

const STEPS = [
  { icon: Cigarette, title: "Your smoking history" },
  { icon: Target, title: "Your quit goals" },
  { icon: Zap, title: "Your triggers" },
  { icon: Users, title: "Your support" },
  { icon: ShieldCheck, title: "Consent" },
] as const;

// Fields validated when leaving each step.
const STEP_FIELDS: (keyof OnboardingValues)[][] = [
  [
    "cigarettes_per_day",
    "years_smoking",
    "cigarette_type",
    "smoking_frequency",
    "cost_per_pack",
    "cigarettes_per_pack",
    "previous_quit_attempts",
  ],
  ["quit_date", "quit_goal"],
  ["common_triggers", "stress_level"],
  ["contact_email"],
  ["consent"],
];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function OnboardingFlow({ firstName }: { firstName: string }) {
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      cigarettes_per_day: 10,
      years_smoking: 5,
      cigarette_type: "",
      smoking_frequency: "",
      cost_per_pack: 8,
      cigarettes_per_pack: 20,
      previous_quit_attempts: 0,
      quit_date: todayISO(),
      quit_goal: "",
      quit_reason: "",
      common_triggers: [],
      stress_level: 5,
      contact_name: "",
      contact_email: "",
      contact_relationship: "",
      consent: undefined as unknown as true,
    },
  });

  const {
    register,
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors },
  } = form;

  const values = watch();
  const isLast = step === STEPS.length - 1;

  async function next() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: OnboardingValues) {
    setSubmitting(true);
    const res = await completeOnboarding(data);
    if (res?.error) {
      toast.error(res.error);
      setSubmitting(false);
    }
    // On success the action redirects.
  }

  function toggleTrigger(t: string) {
    const set = new Set(values.common_triggers ?? []);
    if (set.has(t)) set.delete(t);
    else set.add(t);
    setValue("common_triggers", Array.from(set), { shouldValidate: true });
  }

  const StepIcon = STEPS[step].icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <StepIcon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>
              {step === 0 && firstName
                ? `Let's get to know your habits, ${firstName}`
                : STEPS[step].title}
            </CardTitle>
            <CardDescription>
              This personalizes your risk scoring.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* STEP 1: smoking history */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Cigarettes per day"
                  htmlFor="cigarettes_per_day"
                  error={errors.cigarettes_per_day?.message}
                >
                  <Input
                    id="cigarettes_per_day"
                    type="number"
                    min={0}
                    {...register("cigarettes_per_day")}
                  />
                </Field>
                <Field
                  label="Years smoking"
                  htmlFor="years_smoking"
                  error={errors.years_smoking?.message}
                >
                  <Input
                    id="years_smoking"
                    type="number"
                    min={0}
                    {...register("years_smoking")}
                  />
                </Field>
              </div>

              <Field
                label="What do you mostly use?"
                error={errors.cigarette_type?.message}
              >
                <Select
                  value={values.cigarette_type}
                  onValueChange={(v) =>
                    setValue("cigarette_type", v, { shouldValidate: true })
                  }
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

              <Field
                label="How often do you smoke?"
                error={errors.smoking_frequency?.message}
              >
                <Select
                  value={values.smoking_frequency}
                  onValueChange={(v) =>
                    setValue("smoking_frequency", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SMOKING_FREQUENCY_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Cost per pack ($)"
                  htmlFor="cost_per_pack"
                  error={errors.cost_per_pack?.message}
                >
                  <Input
                    id="cost_per_pack"
                    type="number"
                    step="0.01"
                    min={0}
                    {...register("cost_per_pack")}
                  />
                </Field>
                <Field
                  label="Cigarettes per pack"
                  htmlFor="cigarettes_per_pack"
                  error={errors.cigarettes_per_pack?.message}
                >
                  <Input
                    id="cigarettes_per_pack"
                    type="number"
                    min={1}
                    {...register("cigarettes_per_pack")}
                  />
                </Field>
              </div>

              <Field
                label="Previous quit attempts"
                htmlFor="previous_quit_attempts"
                hint="No judgment. Each attempt teaches you something."
                error={errors.previous_quit_attempts?.message}
              >
                <Input
                  id="previous_quit_attempts"
                  type="number"
                  min={0}
                  {...register("previous_quit_attempts")}
                />
              </Field>
            </div>
          )}

          {/* STEP 2: quit goals */}
          {step === 1 && (
            <div className="space-y-4">
              <Field
                label="Your quit date"
                htmlFor="quit_date"
                hint="Pick today to start now, or a future date to prepare."
                error={errors.quit_date?.message}
              >
                <Input id="quit_date" type="date" {...register("quit_date")} />
              </Field>

              <Field label="Your goal" error={errors.quit_goal?.message}>
                <Select
                  value={values.quit_goal}
                  onValueChange={(v) =>
                    setValue("quit_goal", v, { shouldValidate: true })
                  }
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

              <Field
                label="Why are you quitting?"
                htmlFor="quit_reason"
                hint="We'll remind you of this in your toughest moments."
                error={errors.quit_reason?.message}
              >
                <Textarea
                  id="quit_reason"
                  rows={3}
                  placeholder="For my kids, my health, my freedom…"
                  {...register("quit_reason")}
                />
              </Field>
            </div>
          )}

          {/* STEP 3: triggers */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium">
                  What usually triggers your cravings?
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRIGGER_OPTIONS.map((t) => {
                    const active = (values.common_triggers ?? []).includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTrigger(t)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-muted"
                        )}
                      >
                        {active && <Check className="mr-1 inline h-3.5 w-3.5" />}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field
                label={`Typical stress level: ${values.stress_level}/10`}
                error={errors.stress_level?.message}
              >
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[values.stress_level ?? 5]}
                  onValueChange={(v) =>
                    setValue("stress_level", v[0], { shouldValidate: true })
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Calm</span>
                  <span>Very stressed</span>
                </div>
              </Field>
            </div>
          )}

          {/* STEP 4: support */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adding an accountability contact is optional, but having someone
                in your corner makes a real difference. You can add or change
                this anytime.
              </p>
              <Field label="Contact name" htmlFor="contact_name">
                <Input
                  id="contact_name"
                  placeholder="e.g. Sam"
                  {...register("contact_name")}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Their email"
                  htmlFor="contact_email"
                  error={errors.contact_email?.message}
                >
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="sam@example.com"
                    {...register("contact_email")}
                  />
                </Field>
                <Field label="Relationship" htmlFor="contact_relationship">
                  <Input
                    id="contact_relationship"
                    placeholder="Partner, friend…"
                    {...register("contact_relationship")}
                  />
                </Field>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  Notification preferences
                </p>
                <p className="mt-1">
                  Push and SMS reminders are coming soon. For now, SmokeTrace
                  supports you in-app whenever you open it.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: consent */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-muted-foreground">
                <p className="mb-1 font-semibold text-foreground">
                  Important disclaimer
                </p>
                {DISCLAIMER_TEXT}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/40">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                  checked={values.consent === true}
                  onChange={(e) =>
                    setValue("consent", e.target.checked as true, {
                      shouldValidate: true,
                    })
                  }
                />
                <span className="text-sm">
                  I understand that SmokeTrace provides behavioral support and
                  wellness guidance, not medical advice, and I agree to continue.
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs font-medium text-destructive">
                  {errors.consent.message}
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={step === 0 || submitting}
              className={cn(step === 0 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {isLast ? (
              <Button type="submit" disabled={submitting} size="lg">
                {submitting ? <Spinner /> : null}
                {submitting ? "Creating your plan…" : "Finish & view dashboard"}
              </Button>
            ) : (
              <Button type="button" onClick={next}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
