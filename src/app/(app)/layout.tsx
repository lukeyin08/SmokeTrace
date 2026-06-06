import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getProfileBundle } from "@/lib/supabase/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await getProfileBundle();

  // Onboarding is enforced in middleware, but guard here too for safety.
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <AppShell fullName={profile?.full_name} email={profile?.email ?? user.email}>
      {children}
    </AppShell>
  );
}
