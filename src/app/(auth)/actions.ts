"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Route based on onboarding status.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let onboarded = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    onboarded = profile?.onboarding_completed ?? false;
  }

  redirect(onboarded ? "/dashboard" : "/onboarding");
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!fullName || !email || !password) {
    return { error: "Please fill in all fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, there is no active session yet.
  if (!data.session) {
    return {
      message:
        "Check your inbox to confirm your email, then log in to begin your onboarding.",
    };
  }

  // Ensure a profile row exists with the name (in case the DB trigger is off).
  if (data.user) {
    await supabase
      .from("profiles")
      .upsert(
        { id: data.user.id, email, full_name: fullName },
        { onConflict: "id" }
      );
  }

  redirect("/onboarding");
}
