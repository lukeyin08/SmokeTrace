import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Phone } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DISCLAIMER_TEXT } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy & disclaimer" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-app-gradient">
      <header className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </Button>
      </header>

      <main className="container max-w-3xl py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Privacy & disclaimer
          </h1>
        </div>

        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="p-6">
            <h2 className="mb-2 text-lg font-semibold">Medical disclaimer</h2>
            <p className="text-sm text-muted-foreground">{DISCLAIMER_TEXT}</p>
          </CardContent>
        </Card>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Not a medical device
            </h2>
            <p>
              SmokeTrace is a wellness and behavioral-support tool. It does not
              diagnose, treat, cure, or prevent any disease or condition, and it
              is not a substitute for professional medical advice, diagnosis, or
              treatment. The relapse-risk score is a behavioral estimate based on
              the information you provide, not a clinical measurement. Always
              seek the advice of a qualified health provider with any questions
              about a medical condition or quitting smoking.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              In an emergency
            </h2>
            <p className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                If you are experiencing a medical emergency, chest pain, thoughts
                of self-harm, or severe distress, contact your local emergency
                services immediately (911 in the US) or a crisis line such as
                the 988 Suicide &amp; Crisis Lifeline. For free quit-smoking
                support in the US, call 1-800-QUIT-NOW.
              </span>
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Your data and privacy
            </h2>
            <p>
              Your account data, including cravings, smoking events, triggers,
              and contacts, is stored in your own Supabase-backed database and
              protected by row-level security, so only your authenticated
              account can read or write it. You can delete your data at any time
              from Settings.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              A note on relapse
            </h2>
            <p>
              Relapse is a common part of quitting, not a failure. SmokeTrace is
              built to help you treat a slip as recoverable progress: learn from
              it, reset, and keep going. Be kind to yourself.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
