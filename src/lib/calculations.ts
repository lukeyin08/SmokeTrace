import { differenceInCalendarDays, differenceInHours } from "date-fns";
import type { QuitProfile, SmokingEvent, Craving } from "@/lib/types";

// ---------------------------------------------------------------------------
// Progress calculations: streak, cigarettes avoided, money saved.
// ---------------------------------------------------------------------------

export interface ProgressStats {
  smokeFreeDays: number;
  smokeFreeHours: number;
  /** ISO date the current streak started from. */
  streakStart: string | null;
  cigarettesAvoided: number;
  moneySaved: number;
  costPerCigarette: number;
}

/**
 * The streak starts at the later of: the quit date, or the most recent
 * smoking event. A relapse resets the streak (reframed in the UI as
 * "recoverable progress", never failure).
 */
export function computeStreakStart(
  quitDate: string | null | undefined,
  smokingEvents: Pick<SmokingEvent, "created_at">[]
): Date | null {
  const candidates: Date[] = [];

  if (quitDate) {
    const d = new Date(quitDate);
    if (!Number.isNaN(d.getTime())) candidates.push(d);
  }

  if (smokingEvents.length > 0) {
    const latest = smokingEvents
      .map((e) => new Date(e.created_at))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (latest) candidates.push(latest);
  }

  if (candidates.length === 0) return null;
  // Later of the two = current streak start.
  return candidates.sort((a, b) => b.getTime() - a.getTime())[0];
}

export function computeProgress(
  quitProfile: Pick<
    QuitProfile,
    "quit_date" | "cigarettes_per_day" | "cost_per_pack" | "cigarettes_per_pack"
  > | null,
  smokingEvents: Pick<SmokingEvent, "created_at">[],
  now = new Date()
): ProgressStats {
  const cigsPerDay = quitProfile?.cigarettes_per_day ?? 0;
  const costPerPack = quitProfile?.cost_per_pack ?? 0;
  const cigsPerPack = quitProfile?.cigarettes_per_pack ?? 20;
  const costPerCigarette = cigsPerPack > 0 ? costPerPack / cigsPerPack : 0;

  const streakStart = computeStreakStart(quitProfile?.quit_date, smokingEvents);

  if (!streakStart || streakStart.getTime() > now.getTime()) {
    return {
      smokeFreeDays: 0,
      smokeFreeHours: 0,
      streakStart: streakStart ? streakStart.toISOString() : null,
      cigarettesAvoided: 0,
      moneySaved: 0,
      costPerCigarette,
    };
  }

  const smokeFreeHours = Math.max(0, differenceInHours(now, streakStart));
  const smokeFreeDays = Math.max(0, differenceInCalendarDays(now, streakStart));
  // Use fractional days for smoother "avoided" / "saved" numbers.
  const fractionalDays = smokeFreeHours / 24;

  const cigarettesAvoided = Math.max(0, Math.round(fractionalDays * cigsPerDay));
  const moneySaved = Math.max(0, cigarettesAvoided * costPerCigarette);

  return {
    smokeFreeDays,
    smokeFreeHours,
    streakStart: streakStart.toISOString(),
    cigarettesAvoided,
    moneySaved,
    costPerCigarette,
  };
}

/** Count cravings created within the last `hours`. */
export function countRecent(
  rows: Pick<Craving | SmokingEvent, "created_at">[],
  hours: number,
  now = new Date()
): number {
  return rows.filter(
    (r) => differenceInHours(now, new Date(r.created_at)) < hours
  ).length;
}

/** Whole days since a quit date (negative if quit date is in the future). */
export function daysSinceQuit(
  quitDate: string | null | undefined,
  now = new Date()
): number | null {
  if (!quitDate) return null;
  const d = new Date(quitDate);
  if (Number.isNaN(d.getTime())) return null;
  return differenceInCalendarDays(now, d);
}
