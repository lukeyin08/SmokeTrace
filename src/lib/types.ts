// ---------------------------------------------------------------------------
// Shared application + database types
// ---------------------------------------------------------------------------

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type CravingOutcome = "resisted" | "smoked" | "still_craving";

export type CoachRole = "user" | "assistant";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export type QuitProfile = {
  id: string;
  user_id: string;
  smoking_frequency: string | null;
  cigarettes_per_day: number | null;
  years_smoking: number | null;
  cigarette_type: string | null;
  quit_goal: string | null;
  quit_date: string | null;
  stress_level: number | null;
  common_triggers: string[] | null;
  previous_quit_attempts: number | null;
  cost_per_pack: number | null;
  cigarettes_per_pack: number | null;
  created_at: string;
  updated_at: string;
}

export type Craving = {
  id: string;
  user_id: string;
  intensity: number | null;
  mood: string | null;
  stress_level: number | null;
  sleep_quality: number | null;
  location_label: string | null;
  trigger_type: string | null;
  notes: string | null;
  outcome: CravingOutcome | null;
  created_at: string;
}

export type SmokingEvent = {
  id: string;
  user_id: string;
  cigarettes_count: number;
  trigger_type: string | null;
  location_label: string | null;
  notes: string | null;
  created_at: string;
}

export type Intervention = {
  id: string;
  user_id: string;
  craving_id: string | null;
  type: string | null;
  message: string | null;
  completed: boolean;
  helpful: boolean | null;
  created_at: string;
}

export type TriggerLocation = {
  id: string;
  user_id: string;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  risk_level: number;
  notes: string | null;
  created_at: string;
}

export type AccountabilityContact = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  notify_on_emergency: boolean;
  created_at: string;
}

export type CoachMessage = {
  id: string;
  user_id: string;
  role: CoachRole;
  content: string | null;
  created_at: string;
}

export type Achievement = {
  id: string;
  user_id: string;
  achievement_key: string | null;
  title: string | null;
  description: string | null;
  unlocked_at: string;
}

// ---------------------------------------------------------------------------
// Risk engine
// ---------------------------------------------------------------------------

export type RiskFactor = {
  label: string;
  points: number;
  detail: string;
}

export type RecommendedIntervention = {
  type: string;
  title: string;
  message: string;
  actions: string[];
}

export type RiskScoreInput = {
  /** 0-23, the local hour of day. Defaults to current hour if omitted. */
  hourOfDay?: number;
  cravingIntensity?: number | null;
  stressLevel?: number | null;
  sleepQuality?: number | null;
  /** number of cravings logged in the last 24h */
  recentCravings24h?: number;
  /** number of smoking events in the last 72h */
  recentSmokingEvents72h?: number;
  triggerType?: string | null;
  /** location risk_level 1-10 if the user is at / logging a known place */
  locationRisk?: number | null;
  /** whole days since quit_date (negative if quit date is in the future) */
  daysSinceQuit?: number | null;
}

export type RiskScoreResult = {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  recommendation: RecommendedIntervention;
}
