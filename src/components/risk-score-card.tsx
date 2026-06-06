import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskScoreResult, RiskLevel } from "@/lib/types";

const LEVEL_META: Record<
  RiskLevel,
  { label: string; ring: string; text: string; badge: string; track: string }
> = {
  low: {
    label: "Low risk",
    ring: "stroke-success",
    text: "text-success",
    badge: "bg-success text-success-foreground",
    track: "stroke-success/15",
  },
  moderate: {
    label: "Moderate risk",
    ring: "stroke-warning",
    text: "text-warning",
    badge: "bg-warning text-warning-foreground",
    track: "stroke-warning/15",
  },
  high: {
    label: "High risk",
    ring: "stroke-orange-500",
    text: "text-orange-500",
    badge: "bg-orange-500 text-white",
    track: "stroke-orange-500/15",
  },
  critical: {
    label: "Critical risk",
    ring: "stroke-destructive",
    text: "text-destructive",
    badge: "bg-destructive text-destructive-foreground",
    track: "stroke-destructive/15",
  },
};

function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const meta = LEVEL_META[level];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className={meta.track}
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700", meta.ring)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", meta.text)}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export function RiskScoreCard({
  result,
  compact = false,
}: {
  result: RiskScoreResult;
  compact?: boolean;
}) {
  const meta = LEVEL_META[result.level];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Relapse risk</CardTitle>
          <Badge className={meta.badge}>{meta.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <RiskGauge score={result.score} level={result.level} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{result.recommendation.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.recommendation.message}
            </p>
            {!compact && result.factors.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Top contributing factors
                </p>
                <ul className="mt-1.5 space-y-1">
                  {result.factors.map((f) => (
                    <li
                      key={f.label}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-medium">+{f.points}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
