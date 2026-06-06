import { format, subDays, startOfDay, isAfter } from "date-fns";
import type { Craving, SmokingEvent, Intervention } from "@/lib/types";
import type { DayPoint, CountPoint } from "@/components/charts/progress-charts";

/** Build a per-day series over the last `days` days for cravings + stress. */
export function buildDailySeries(
  cravings: Pick<Craving, "intensity" | "stress_level" | "created_at">[],
  days = 14,
  now = new Date()
): DayPoint[] {
  const buckets = new Map<
    string,
    { count: number; intensitySum: number; stressSum: number; stressN: number }
  >();

  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(now, i), "MMM d");
    buckets.set(key, { count: 0, intensitySum: 0, stressSum: 0, stressN: 0 });
  }

  const cutoff = startOfDay(subDays(now, days - 1));
  for (const c of cravings) {
    const d = new Date(c.created_at);
    if (!isAfter(d, cutoff)) continue;
    const key = format(d, "MMM d");
    const b = buckets.get(key);
    if (!b) continue;
    b.count += 1;
    b.intensitySum += c.intensity ?? 0;
    if (typeof c.stress_level === "number") {
      b.stressSum += c.stress_level;
      b.stressN += 1;
    }
  }

  return Array.from(buckets.entries()).map(([date, b]) => ({
    date,
    count: b.count,
    avgIntensity: b.count ? Math.round((b.intensitySum / b.count) * 10) / 10 : 0,
    avgStress: b.stressN ? Math.round((b.stressSum / b.stressN) * 10) / 10 : 0,
  }));
}

/** Per-day cigarette counts over the last `days` days. */
export function buildSmokingSeries(
  events: Pick<SmokingEvent, "cigarettes_count" | "created_at">[],
  days = 14,
  now = new Date()
): CountPoint[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(format(subDays(now, i), "MMM d"), 0);
  }
  const cutoff = startOfDay(subDays(now, days - 1));
  for (const e of events) {
    const d = new Date(e.created_at);
    if (!isAfter(d, cutoff)) continue;
    const key = format(d, "MMM d");
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + (e.cigarettes_count ?? 1));
    }
  }
  return Array.from(buckets.entries()).map(([label, count]) => ({
    label,
    count,
  }));
}

/** Count occurrences of a string field, sorted desc, top N. */
export function topCounts<T>(
  rows: T[],
  pick: (row: T) => string | null | undefined,
  topN = 6
): CountPoint[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = pick(r);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/** Best coping strategies = helpful interventions grouped by type. */
const TYPE_LABELS: Record<string, string> = {
  emergency_mode: "Emergency mode",
  reinforcement: "Motivation",
  coping_skill: "Breathing / water / walk",
  active_intervention: "Active intervention",
  urgent_intervention: "Urgent support",
};

export function bestCopingStrategies(
  interventions: Pick<Intervention, "type" | "helpful">[]
): CountPoint[] {
  return topCounts(
    interventions.filter((i) => i.helpful === true),
    (i) => (i.type ? TYPE_LABELS[i.type] ?? i.type : null),
    6
  );
}

export function averageIntensity(
  cravings: Pick<Craving, "intensity">[]
): number {
  if (cravings.length === 0) return 0;
  const sum = cravings.reduce((acc, c) => acc + (c.intensity ?? 0), 0);
  return Math.round((sum / cravings.length) * 10) / 10;
}

export function resistedRate(
  cravings: Pick<Craving, "outcome">[]
): number {
  if (cravings.length === 0) return 0;
  const resisted = cravings.filter((c) => c.outcome === "resisted").length;
  return Math.round((resisted / cravings.length) * 100);
}
