// ---------------------------------------------------------------------------
// Shared option lists and copy used across forms and the AI coach.
// ---------------------------------------------------------------------------

export const MOOD_OPTIONS = [
  "Calm",
  "Happy",
  "Neutral",
  "Bored",
  "Anxious",
  "Stressed",
  "Sad",
  "Angry",
  "Lonely",
  "Tired",
] as const;

export const TRIGGER_OPTIONS = [
  "Stress",
  "Social situation",
  "Boredom",
  "After a meal",
  "Driving",
  "Bar / alcohol",
  "Work / school",
  "Coffee",
  "Phone / screen time",
  "Specific location",
  "Other",
] as const;

export const SMOKING_FREQUENCY_OPTIONS = [
  "A few times a week",
  "Daily, light (1-10/day)",
  "Daily, moderate (11-20/day)",
  "Daily, heavy (20+/day)",
] as const;

export const CIGARETTE_TYPE_OPTIONS = [
  "Cigarettes",
  "Vape / e-cigarette",
  "Rolling tobacco",
  "Cigars",
  "Nicotine pouches",
  "Mixed",
] as const;

export const QUIT_GOAL_OPTIONS = [
  "Quit completely",
  "Gradually reduce",
  "Stay quit (already stopped)",
  "Cut down before quitting",
] as const;

export const DISCLAIMER_TEXT =
  "SmokeTrace provides behavioral support and wellness guidance, not medical advice. It is not a medical device and does not diagnose, treat, or cure any condition. If you are in crisis or experiencing a medical emergency, contact your local emergency services or a healthcare professional.";
