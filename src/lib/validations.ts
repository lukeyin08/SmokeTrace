import { z } from "zod";

// --- Auth -----------------------------------------------------------------
export const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Please enter your name").max(80),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

// --- Onboarding -----------------------------------------------------------
export const onboardingSchema = z.object({
  // Step 1: smoking history
  cigarettes_per_day: z.coerce.number().int().min(0).max(200),
  years_smoking: z.coerce.number().int().min(0).max(100),
  cigarette_type: z.string().min(1, "Select a type"),
  smoking_frequency: z.string().min(1, "Select your frequency"),
  cost_per_pack: z.coerce.number().min(0).max(1000),
  cigarettes_per_pack: z.coerce.number().int().min(1).max(100),
  previous_quit_attempts: z.coerce.number().int().min(0).max(100),
  // Step 2: quit goals
  quit_date: z.string().min(1, "Pick a quit date"),
  quit_goal: z.string().min(1, "Select a goal"),
  quit_reason: z.string().max(500).optional().default(""),
  // Step 3: triggers
  common_triggers: z.array(z.string()).default([]),
  stress_level: z.coerce.number().int().min(1).max(10).default(5),
  // Step 4: support (optional contact)
  contact_name: z.string().max(80).optional().default(""),
  contact_email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  contact_relationship: z.string().max(80).optional().default(""),
  // Step 5: consent
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must accept to continue" }),
  }),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

// --- Craving --------------------------------------------------------------
export const cravingSchema = z.object({
  intensity: z.coerce.number().int().min(1).max(10),
  mood: z.string().min(1, "Select a mood"),
  stress_level: z.coerce.number().int().min(1).max(10),
  sleep_quality: z.coerce.number().int().min(1).max(10),
  trigger_type: z.string().optional().default(""),
  location_label: z.string().max(120).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
  outcome: z
    .enum(["resisted", "smoked", "still_craving"])
    .default("still_craving"),
});

export type CravingValues = z.infer<typeof cravingSchema>;

// --- Smoking event --------------------------------------------------------
export const smokingEventSchema = z.object({
  cigarettes_count: z.coerce.number().int().min(1).max(100).default(1),
  trigger_type: z.string().optional().default(""),
  location_label: z.string().max(120).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

export type SmokingEventValues = z.infer<typeof smokingEventSchema>;

// --- Trigger location -----------------------------------------------------
export const triggerLocationSchema = z.object({
  name: z.string().min(1, "Name this place").max(120),
  address: z.string().max(240).optional().default(""),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  radius_meters: z.coerce.number().int().min(10).max(5000).default(100),
  risk_level: z.coerce.number().int().min(1).max(10).default(5),
  notes: z.string().max(500).optional().default(""),
});

export type TriggerLocationValues = z.infer<typeof triggerLocationSchema>;

// --- Accountability contact ----------------------------------------------
export const accountabilityContactSchema = z.object({
  name: z.string().min(1, "Enter a name").max(80),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().default(""),
  relationship: z.string().max(80).optional().default(""),
  notify_on_emergency: z.boolean().default(false),
});

export type AccountabilityContactValues = z.infer<
  typeof accountabilityContactSchema
>;

// --- Settings: profile + quit profile ------------------------------------
export const profileSchema = z.object({
  full_name: z.string().max(80).optional().default(""),
  username: z.string().max(40).optional().default(""),
});

export const quitProfileSchema = z.object({
  cigarettes_per_day: z.coerce.number().int().min(0).max(200),
  years_smoking: z.coerce.number().int().min(0).max(100),
  cigarette_type: z.string().optional().default(""),
  quit_date: z.string().optional().default(""),
  quit_goal: z.string().optional().default(""),
  cost_per_pack: z.coerce.number().min(0).max(1000),
  cigarettes_per_pack: z.coerce.number().int().min(1).max(100),
  stress_level: z.coerce.number().int().min(1).max(10),
});
