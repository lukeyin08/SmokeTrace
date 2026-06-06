import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Cigarette,
  Coins,
  Flame,
  Gauge,
  LineChart as LineChartIcon,
  ShieldCheck,
  Target,
  TrendingDown,
  Zap,
} from "lucide-react";

import { getProfileBundle } from "@/lib/supabase/queries";
import { computeProgress } from "@/lib/calculations";
import {
  buildDailySeries,
  buildSmokingSeries,
  topCounts,
  bestCopingStrategies,
  averageIntensity,
  resistedRate,
} from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Craving, SmokingEvent, Intervention } from "@/lib/types";

import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CravingsOverTimeChart,
  StressVsCravingsChart,
  SmokingOverTimeChart,
  HorizontalCountChart,
} from "@/components/charts/progress-charts";

export const metadata: Metadata = { title: "Progress & analytics" };

export default async function ProgressPage() {
  const { supabase, user, quitProfile } = await getProfileBundle();

  const [{ data: cravingsData }, { data: smokingData }, { data: intervData }] =
    await Promise.all([
      supabase
        .from("cravings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("smoking_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("interventions")
        .select("type, helpful")
        .eq("user_id", user.id)
        .limit(500),
    ]);

  const cravings = (cravingsData ?? []) as Craving[];
  const smokingEvents = (smokingData ?? []) as SmokingEvent[];
  const interventions = (intervData ?? []) as Intervention[];

  const progress = computeProgress(quitProfile, smokingEvents);
  const dailySeries = buildDailySeries(cravings, 14);
  const smokingSeries = buildSmokingSeries(smokingEvents, 14);
  const triggerCounts = topCounts(cravings, (c) => c.trigger_type);
  const coping = bestCopingStrategies(interventions);
  const avgIntensity = averageIntensity(cravings);
  const resisted = resistedRate(cravings);

  const hasData = cravings.length > 0 || smokingEvents.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          icon={LineChartIcon}
          title="Your analytics will appear here"
          description="Once you start logging cravings, you'll see trends, triggers, and the coping strategies that work best for you."
          action={
            <Button asChild>
              <Link href="/cravings/new">Log your first craving</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Smoke-free"
          value={`${progress.smokeFreeDays}d`}
          accent="success"
        />
        <StatCard
          icon={Cigarette}
          label="Avoided"
          value={formatNumber(progress.cigarettesAvoided)}
          accent="primary"
        />
        <StatCard
          icon={Coins}
          label="Saved"
          value={formatCurrency(progress.moneySaved)}
          accent="warning"
        />
        <StatCard
          icon={ShieldCheck}
          label="Resisted"
          value={`${resisted}%`}
          sublabel="of cravings"
          accent="success"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Avg intensity"
          value={`${avgIntensity}/10`}
          accent="muted"
        />
        <StatCard
          icon={Activity}
          label="Cravings logged"
          value={formatNumber(cravings.length)}
          accent="muted"
        />
        <StatCard
          icon={TrendingDown}
          label="Relapses"
          value={formatNumber(smokingEvents.length)}
          accent="muted"
        />
        <StatCard
          icon={Target}
          label="Interventions"
          value={formatNumber(interventions.length)}
          accent="muted"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Cravings over time"
          description="Daily craving count over the last 14 days."
        >
          <CravingsOverTimeChart data={dailySeries} />
        </ChartCard>

        <ChartCard
          title="Stress vs. cravings"
          description="How your stress and craving intensity move together."
        >
          <StressVsCravingsChart data={dailySeries} />
        </ChartCard>

        <ChartCard
          title="Smoking events over time"
          description="Recorded relapses by day. Remember: each one is recoverable."
        >
          <SmokingOverTimeChart data={smokingSeries} />
        </ChartCard>

        <ChartCard
          title="Common triggers"
          description="What sets off your cravings most often."
        >
          {triggerCounts.length > 0 ? (
            <HorizontalCountChart data={triggerCounts} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Add trigger types when logging cravings to see this.
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Best coping strategies"
          description="The interventions you've found most helpful."
        >
          {coping.length > 0 ? (
            <HorizontalCountChart data={coping} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Zap className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Mark interventions as helpful to learn what works for you.
              </p>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Progress & analytics
      </h1>
      <p className="text-sm text-muted-foreground">
        Your patterns, made visible.
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
