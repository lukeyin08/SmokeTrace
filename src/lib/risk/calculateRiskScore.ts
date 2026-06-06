import type {
  RiskScoreInput,
  RiskScoreResult,
  RiskLevel,
  RiskFactor,
  RecommendedIntervention,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Rule-based relapse-risk engine.
//
// This is intentionally transparent and deterministic so it can run on the
// client or server with no external dependency. A future ML model can be
// swapped in behind the same calculateRiskScore() interface.
//
// Point budget (max 100):
//   craving intensity ........ up to 25
//   stress level ............. up to 20
//   poor sleep ............... up to 15
//   recent craving frequency . up to 15
//   recent relapse ........... up to 15
//   known trigger ............ up to 10
//   (location risk + time-of-day act as smaller modifiers within the cap)
// ---------------------------------------------------------------------------

const HIGH_RISK_TRIGGERS = new Set([
  "Stress",
  "Bar / alcohol",
  "Social situation",
  "After a meal",
  "Driving",
]);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function levelFor(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "moderate";
  return "low";
}

function recommendationFor(
  level: RiskLevel,
  topFactor?: RiskFactor
): RecommendedIntervention {
  switch (level) {
    case "critical":
      return {
        type: "urgent_intervention",
        title: "Urgent support: let's get through this together",
        message:
          "This is a high-risk moment, and that's exactly when a short pause matters most. Start a 5-minute delay timer, breathe, and reach out. Cravings peak and pass, and you can ride this one out.",
        actions: [
          "Open Emergency Craving Mode",
          "Start a 5-minute delay timer",
          "Message an accountability contact",
          "Review relapse-recovery guidance",
        ],
      };
    case "high":
      return {
        type: "active_intervention",
        title: "Let's interrupt this craving",
        message: topFactor
          ? `Your risk is elevated, mainly driven by ${topFactor.label.toLowerCase()}. A quick, structured break now can change the outcome.`
          : "Your risk is elevated. A quick, structured break now can change the outcome.",
        actions: [
          "Start the emergency craving timer",
          "Try a 2-minute breathing exercise",
          "Reach out to an accountability contact",
        ],
      };
    case "moderate":
      return {
        type: "coping_skill",
        title: "A small reset will help",
        message:
          "You're in a manageable spot. A short, simple action can keep the craving from building.",
        actions: [
          "Try a 2-minute breathing exercise",
          "Drink a glass of water",
          "Take a short walk",
        ],
      };
    case "low":
    default:
      return {
        type: "reinforcement",
        title: "You're doing great, keep the momentum",
        message:
          "Your relapse risk is low right now. This is a perfect moment to notice your progress and reinforce why you started.",
        actions: [
          "Review your progress and streak",
          "Read a motivational reminder",
        ],
      };
  }
}

export function calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
  const {
    hourOfDay,
    cravingIntensity,
    stressLevel,
    sleepQuality,
    recentCravings24h = 0,
    recentSmokingEvents72h = 0,
    triggerType,
    locationRisk,
    daysSinceQuit,
  } = input;

  const factors: RiskFactor[] = [];
  let score = 0;

  // Craving intensity (1-10) -> up to 25
  if (typeof cravingIntensity === "number" && cravingIntensity > 0) {
    const pts = Math.round((clamp(cravingIntensity, 1, 10) / 10) * 25);
    score += pts;
    if (pts > 0) {
      factors.push({
        label: "Craving intensity",
        points: pts,
        detail: `Intensity rated ${cravingIntensity}/10.`,
      });
    }
  }

  // Stress (1-10) -> up to 20
  if (typeof stressLevel === "number" && stressLevel > 0) {
    const pts = Math.round((clamp(stressLevel, 1, 10) / 10) * 20);
    score += pts;
    if (pts > 0) {
      factors.push({
        label: "Stress level",
        points: pts,
        detail: `Stress rated ${stressLevel}/10.`,
      });
    }
  }

  // Poor sleep (lower quality = higher risk) -> up to 15
  if (typeof sleepQuality === "number" && sleepQuality > 0) {
    const deficit = clamp(10 - clamp(sleepQuality, 1, 10), 0, 9);
    const pts = Math.round((deficit / 9) * 15);
    score += pts;
    if (pts > 0) {
      factors.push({
        label: "Poor sleep",
        points: pts,
        detail: `Sleep quality rated ${sleepQuality}/10.`,
      });
    }
  }

  // Recent craving frequency -> up to 15 (caps at ~5 cravings/24h)
  if (recentCravings24h > 0) {
    const pts = Math.round((clamp(recentCravings24h, 0, 5) / 5) * 15);
    score += pts;
    if (pts > 0) {
      factors.push({
        label: "Frequent recent cravings",
        points: pts,
        detail: `${recentCravings24h} craving${
          recentCravings24h === 1 ? "" : "s"
        } in the last 24 hours.`,
      });
    }
  }

  // Recent relapse -> up to 15
  if (recentSmokingEvents72h > 0) {
    const pts = clamp(8 + recentSmokingEvents72h * 4, 0, 15);
    score += pts;
    factors.push({
      label: "Recent relapse",
      points: pts,
      detail: `${recentSmokingEvents72h} smoking event${
        recentSmokingEvents72h === 1 ? "" : "s"
      } in the last 72 hours.`,
    });
  }

  // Known trigger -> up to 10
  if (triggerType && HIGH_RISK_TRIGGERS.has(triggerType)) {
    const pts = 10;
    score += pts;
    factors.push({
      label: "Known high-risk trigger",
      points: pts,
      detail: `Trigger: ${triggerType}.`,
    });
  } else if (triggerType && triggerType !== "Other") {
    const pts = 5;
    score += pts;
    factors.push({
      label: "Trigger present",
      points: pts,
      detail: `Trigger: ${triggerType}.`,
    });
  }

  // Location risk modifier -> up to 8
  if (typeof locationRisk === "number" && locationRisk > 0) {
    const pts = Math.round((clamp(locationRisk, 1, 10) / 10) * 8);
    score += pts;
    if (pts > 0) {
      factors.push({
        label: "High-risk location",
        points: pts,
        detail: `Location risk rated ${locationRisk}/10.`,
      });
    }
  }

  // Time-of-day modifier: late evening / late night are riskier -> up to 6
  const hour = typeof hourOfDay === "number" ? hourOfDay : new Date().getHours();
  if (hour >= 21 || hour < 3) {
    const pts = 6;
    score += pts;
    factors.push({
      label: "Late-night hours",
      points: pts,
      detail: "Cravings are often stronger and harder to resist late at night.",
    });
  } else if (hour >= 18) {
    const pts = 3;
    score += pts;
    factors.push({
      label: "Evening hours",
      points: pts,
      detail: "Evenings can carry slightly higher craving risk.",
    });
  }

  // Early quit journey is more fragile -> up to 8
  if (typeof daysSinceQuit === "number" && daysSinceQuit >= 0) {
    let pts = 0;
    if (daysSinceQuit <= 3) pts = 8;
    else if (daysSinceQuit <= 7) pts = 5;
    else if (daysSinceQuit <= 14) pts = 3;
    if (pts > 0) {
      score += pts;
      factors.push({
        label: "Early in your quit journey",
        points: pts,
        detail: `Day ${daysSinceQuit} smoke-free. The first weeks are the most fragile.`,
      });
    }
  }

  score = clamp(Math.round(score), 0, 100);
  const level = levelFor(score);

  // Sort factors by contribution, keep the top contributors.
  factors.sort((a, b) => b.points - a.points);
  const topFactors = factors.slice(0, 4);

  return {
    score,
    level,
    factors: topFactors,
    recommendation: recommendationFor(level, topFactors[0]),
  };
}
