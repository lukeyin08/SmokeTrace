"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Cigarette,
  Droplets,
  HeartHandshake,
  Phone,
  Sparkles,
  Wind,
} from "lucide-react";
import { toast } from "sonner";

import { UrgeTimer } from "@/components/urge-timer";
import { BreathingExercise } from "@/components/breathing-exercise";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  recordGotThroughIt,
  recordEmergencyRelapse,
} from "@/app/emergency/actions";
import type { AccountabilityContact } from "@/lib/types";

const COPING_TIPS = [
  { icon: Droplets, text: "Drink a full glass of cold water, slowly." },
  { icon: Wind, text: "Step outside or to a window and take 10 deep breaths." },
  { icon: Sparkles, text: "Change your environment. Move to a different room." },
  { icon: HeartHandshake, text: "Text someone. You don't have to do this alone." },
];

const PREWRITTEN_MESSAGE =
  "Hey, I'm having a strong craving right now. Can you check in with me for a few minutes?";

type View = "active" | "success" | "relapse";

export function EmergencyMode({
  contacts,
  quitReason,
}: {
  contacts: Pick<AccountabilityContact, "name" | "phone" | "email">[];
  quitReason?: string | null;
}) {
  const router = useRouter();
  const [view, setView] = React.useState<View>("active");
  const [pending, setPending] = React.useState(false);
  const [showBreathing, setShowBreathing] = React.useState(false);

  const contact = contacts.find((c) => c.phone) || contacts[0];

  async function gotThroughIt() {
    setPending(true);
    const res = await recordGotThroughIt();
    setPending(false);
    if (res.error) return toast.error(res.error);
    setView("success");
  }

  async function smoked() {
    setPending(true);
    const res = await recordEmergencyRelapse();
    setPending(false);
    if (res.error) return toast.error(res.error);
    setView("relapse");
  }

  if (view === "success") {
    return (
      <ResultScreen
        tone="success"
        icon={Check}
        title="You made it through."
        body="That craving felt huge, and you outlasted it. This is how quitting works: one urge at a time. You're still smoke-free right now, and that's a win worth keeping."
        primary={
          <Button size="lg" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        }
        secondary={
          <Button size="lg" variant="outline" asChild>
            <Link href="/progress">View progress</Link>
          </Button>
        }
      />
    );
  }

  if (view === "relapse") {
    return (
      <ResultScreen
        tone="primary"
        icon={HeartHandshake}
        title="This is recoverable progress, not failure."
        body="Be gentle with yourself. A slip doesn't erase your progress, it's a data point. Logging what happened helps you spot the pattern and plan for next time."
        primary={
          <Button size="lg" asChild>
            <Link href="/cravings/new">Log what happened</Link>
          </Button>
        }
        secondary={
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" /> Exit
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Emergency Craving Mode
        </span>
        <span className="w-14" />
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
          Pause. You only need to get through the next few minutes.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cravings peak and pass, usually within 3 to 5 minutes. Stay here until
          this one fades.
        </p>
      </div>

      {/* Timer / breathing */}
      <Card className="mb-5">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          {showBreathing ? (
            <BreathingExercise />
          ) : (
            <UrgeTimer
              seconds={300}
              onComplete={() =>
                toast.success("5 minutes down. The hardest part is behind you.")
              }
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBreathing((s) => !s)}
          >
            {showBreathing ? "Show urge timer" : "Show breathing exercise"}
          </Button>
        </CardContent>
      </Card>

      {quitReason && (
        <Card className="mb-5 border-primary/20 bg-primary/5">
          <CardContent className="p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Remember why you started
            </p>
            <p className="mt-1 text-sm">{quitReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="mb-5 grid gap-2">
        {contact ? (
          <Button asChild variant="outline" size="lg" className="justify-start">
            <a
              href={
                contact.phone
                  ? `sms:${contact.phone}?body=${encodeURIComponent(
                      PREWRITTEN_MESSAGE
                    )}`
                  : `mailto:${contact.email}?subject=${encodeURIComponent(
                      "Quick check-in?"
                    )}&body=${encodeURIComponent(PREWRITTEN_MESSAGE)}`
              }
            >
              <Phone className="h-5 w-5" /> Reach {contact.name || "your contact"}
            </a>
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg" className="justify-start">
            <Link href="/accountability">
              <Phone className="h-5 w-5" /> Add a support contact
            </Link>
          </Button>
        )}
      </div>

      {/* Coping suggestions */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-semibold">Quick coping moves</p>
          <ul className="space-y-2.5">
            {COPING_TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <li key={tip.text} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {tip.text}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Outcome buttons */}
      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          variant="success"
          onClick={gotThroughIt}
          disabled={pending}
        >
          {pending ? <Spinner /> : <Check className="h-5 w-5" />}
          I got through it
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={smoked}
          disabled={pending}
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <Cigarette className="h-5 w-5" />
          I smoked
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        SmokeTrace provides behavioral support, not medical advice. In a medical
        emergency, call your local emergency number.
      </p>
    </div>
  );
}

function ResultScreen({
  tone,
  icon: Icon,
  title,
  body,
  primary,
  secondary,
}: {
  tone: "success" | "primary";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  primary: React.ReactNode;
  secondary: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
          tone === "success"
            ? "bg-success/15 text-success"
            : "bg-primary/15 text-primary"
        }`}
      >
        <Icon className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <div className="mt-8 flex w-full flex-col gap-3">
        {primary}
        {secondary}
      </div>
    </div>
  );
}
