import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldCheck, UserCog, Cigarette, AlertTriangle } from "lucide-react";

import { getProfileBundle } from "@/lib/supabase/queries";
import { DISCLAIMER_TEXT } from "@/lib/constants";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { QuitSettingsForm } from "@/components/settings/quit-settings-form";
import { DangerZone } from "@/components/settings/danger-zone";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, profile, quitProfile } = await getProfileBundle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, quit plan, and account.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your basic account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            fullName={profile?.full_name ?? ""}
            username={profile?.username ?? ""}
            email={profile?.email ?? user.email ?? ""}
          />
        </CardContent>
      </Card>

      {/* Quit profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cigarette className="h-5 w-5 text-primary" />
            <CardTitle>Quit profile</CardTitle>
          </div>
          <CardDescription>
            These values power your streak, savings, and risk scoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuitSettingsForm quitProfile={quitProfile} />
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-warning" />
            <CardTitle>Disclaimer</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{DISCLAIMER_TEXT}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/privacy">Read privacy & disclaimer</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Sign out or remove your data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action="/logout" method="post">
            <Button type="submit" variant="outline">
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </form>
          <Separator />
          <div>
            <p className="mb-1 text-sm font-medium">Danger zone</p>
            <p className="mb-3 text-sm text-muted-foreground">
              Permanently delete all your SmokeTrace data.
            </p>
            <DangerZone />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
