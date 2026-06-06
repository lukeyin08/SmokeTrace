import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarCheck,
  Cigarette,
  Coins,
  Flame,
  LineChart,
  Plus,
  Sparkles,
} from "lucide-react";

import { getProfileBundle } from "@/lib/supabase/queries";
import { computeProgress } from "@/lib/calculations";
import { computeCurrentRisk } from "@/lib/risk/currentRisk";
import { greeting, formatCurrency, formatNumber } from "@/lib/utils";
import type { Craving, SmokingEvent } from "@/lib/types";

import { StatCard } from "@/components/stat-card";
import { RiskScoreCard } from "@/components/risk-score-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RecentCravingsChart,
  type CravingPoint,
} from "@/components/charts/recent-cravings-chart";

export const metadata: Metadata = { title: "Dashboard" };

const OUTCOME_BADGE: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" }
> = {
  resisted: { label: "Resisted", variant: "success" },
  smoked: { label: "Smoked", variant: "destructive" },
  still_craving: { label: "Still craving", variant: "warning" },
};

export default async function DashboardPage() {
  const { supabase, user, profile, quitProfile } = await getProfileBundle();

  const [{ data: cravingsData }, { data: smokingData }] = await Promise.all([
    supabase
      .from("cravings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("smoking_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const cravings = (cravingsData ?? []) as Craving[];
  const smokingEvents = (smokingData ?? []) as SmokingEvent[];

  const progress = computeProgress(quitProfile, smokingEvents);
  const risk = computeCurrentRisk(cravings, smokingEvents, quitProfile);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const todaysCravings = cravings.filter(
    (c) => new Date(c.created_at).toDateString() === new Date().toDateString()
  );

  // Build a small chart series from the last 8 cravings (chronological).
  const chartData: CravingPoint[] = [...cravings]
    .slice(0, 8)
    .reverse()
    .map((c) => ({
      label: format(new Date(c.created_at), "MMM d"),
      intensity: c.intensity ?? 0,
    }));

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {progress.smokeFreeDays > 0
            ? `You're ${progress.smokeFreeDays} day${
                progress.smokeFreeDays === 1 ? "" : "s"
              } into this streak. Keep going.`
            : "Every smoke-free hour counts. Let's make today a strong one."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Smoke-free"
          value={`${progress.smokeFreeDays}d`}
          sublabel={`${progress.smokeFreeHours}h total`}
          accent="success"
        />
        <StatCard
          icon={Cigarette}
          label="Avoided"
          value={formatNumber(progress.cigarettesAvoided)}
          sublabel="cigarettes"
          accent="primary"
        />
        <StatCard
          icon={Coins}
          label="Saved"
          value={formatCurrency(progress.moneySaved)}
          sublabel="and counting"
          accent="warning"
        />
        <StatCard
          icon={CalendarCheck}
          label="Cravings today"
          value={todaysCravings.length}
          sublabel={`${todaysCravings.filter((c) => c.outcome === "resisted").length} resisted`}
          accent="muted"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction
          href="/cravings/new"
          icon={Plus}
          label="Log craving"
          tone="primary"
        />
        <QuickAction
          href="/emergency"
          icon={AlertTriangle}
          label="Emergency"
          tone="destructive"
        />
        <QuickAction
          href="/progress"
          icon={LineChart}
          label="Progress"
          tone="muted"
        />
      </div>

      {/* Risk + recommendation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RiskScoreCard result={risk} />

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Recommended right now</CardTitle>
            </div>
            <CardDescription>{risk.recommendation.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {risk.recommendation.message}
            </p>
            <ul className="space-y-1.5">
              {risk.recommendation.actions.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {a}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              {risk.level === "critical" || risk.level === "high" ? (
                <Button asChild variant="destructive" size="sm">
                  <Link href="/emergency">Open emergency mode</Link>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href="/cravings/new">Log a craving</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/progress">View progress</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent cravings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent cravings</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/progress">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cravings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No cravings logged yet"
              description="Logging cravings, even the ones you resist, sharpens your risk predictions."
              action={
                <Button asChild>
                  <Link href="/cravings/new">Log your first craving</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-5">
              {chartData.length > 1 && <RecentCravingsChart data={chartData} />}
              <ul className="divide-y">
                {cravings.slice(0, 5).map((c) => {
                  const badge = OUTCOME_BADGE[c.outcome ?? "still_craving"];
                  return (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          Intensity {c.intensity}/10
                          {c.trigger_type ? ` · ${c.trigger_type}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(c.created_at), "EEE, MMM d · h:mm a")}
                          {c.mood ? ` · ${c.mood}` : ""}
                        </p>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  tone,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "primary" | "destructive" | "muted";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary hover:bg-primary/15",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/15",
    muted: "bg-muted text-foreground hover:bg-muted/70",
  } as const;

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center text-sm font-medium transition-colors ${toneMap[tone]}`}
    >
      <Icon className="h-6 w-6" />
      {label}
    </Link>
  );
}
