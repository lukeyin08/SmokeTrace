import { calculateRiskScore } from "@/lib/risk/calculateRiskScore";
import { countRecent, daysSinceQuit } from "@/lib/calculations";
import type { Craving, SmokingEvent, QuitProfile, RiskScoreResult } from "@/lib/types";

/**
 * Derive the user's *current* relapse risk from their recent activity.
 * Uses the most recent craving (if any) plus 24h/72h activity counts and
 * quit-journey context.
 */
export function computeCurrentRisk(
  cravings: Pick<
    Craving,
    "intensity" | "stress_level" | "sleep_quality" | "trigger_type" | "created_at"
  >[],
  smokingEvents: Pick<SmokingEvent, "created_at">[],
  quitProfile: Pick<QuitProfile, "quit_date" | "stress_level"> | null,
  now = new Date()
): RiskScoreResult {
  const latest = cravings[0];

  return calculateRiskScore({
    hourOfDay: now.getHours(),
    cravingIntensity: latest?.intensity ?? null,
    stressLevel: latest?.stress_level ?? quitProfile?.stress_level ?? null,
    sleepQuality: latest?.sleep_quality ?? null,
    recentCravings24h: countRecent(cravings, 24, now),
    recentSmokingEvents72h: countRecent(smokingEvents, 72, now),
    triggerType: latest?.trigger_type ?? null,
    daysSinceQuit: daysSinceQuit(quitProfile?.quit_date, now),
  });
}
