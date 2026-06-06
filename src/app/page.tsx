import Link from "next/link";
import {
  Activity,
  ArrowRight,
  HeartHandshake,
  HeartPulse,
  LineChart,
  MapPin,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FounderAvatar } from "@/components/founder-avatar";

const FEATURES = [
  {
    icon: Activity,
    title: "Relapse risk score",
    description: "Know when you're most likely to slip.",
  },
  {
    icon: MapPin,
    title: "Trigger tracking",
    description: "Spot the places and patterns that trip you up.",
  },
  {
    icon: LineChart,
    title: "Progress dashboard",
    description: "Streaks, money saved, cravings beaten.",
  },
  {
    icon: Users,
    title: "Accountability",
    description: "Reach your people with one tap.",
  },
  {
    icon: HeartPulse,
    title: "Emergency mode",
    description: "A timer and breathing for the hard minutes.",
  },
  {
    icon: HeartHandshake,
    title: "Always free",
    description: "No ads, no upsells, not for profit.",
  },
];

const STEPS = [
  { step: "1", title: "Set up your quit profile" },
  { step: "2", title: "Log cravings in seconds" },
  { step: "3", title: "Get support when it counts" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center py-20 text-center md:py-28">
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Quit smoking. Predict cravings before they become relapses.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            SmokeTrace helps you beat nicotine addiction: track cravings, see
            your relapse risk, and get support before the next craving wins.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/signup">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Always free · Your data stays private
          </p>
        </section>

        {/* Traction */}
        <section className="border-y bg-muted/30 py-10">
          <div className="container flex items-center justify-center gap-12 sm:gap-20">
            <div className="text-center">
              <p className="text-3xl font-bold tracking-tight text-primary">
                100+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Active users</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold tracking-tight text-primary">
                $5k+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Raised so far</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to stay quit
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              How it works
            </h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.step} className="flex items-center gap-4 md:flex-col md:text-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {s.step}
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="container py-20">
          <Card className="mx-auto max-w-4xl">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-start">
                <div className="md:shrink-0">
                  <FounderAvatar className="h-64 w-full md:h-72 md:w-64" />
                  <p className="mt-3 font-semibold">Luke Yin</p>
                  <p className="text-sm text-muted-foreground">Founder · 2024</p>
                </div>
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  <p>
                    My grandfather was a lifelong smoker. He tried to quit, but
                    always relapsed, believing the effort wasn't worth it. He was
                    wrong.
                  </p>
                  <p>
                    On my fifth birthday, he was diagnosed with stage four lung
                    cancer, which took his life a few months later.
                  </p>
                  <p>
                    I built SmokeTrace so that no one has to face the moment
                    before a relapse alone, the way he did.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="border-t bg-muted/30 py-20 text-center">
          <div className="container">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Your next smoke-free day starts now.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Free, private, and here whenever you need it.
            </p>
            <Button asChild size="lg" className="mt-8 gap-2">
              <Link href="/signup">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p className="text-center text-xs">
            Behavioral support, not medical advice.
          </p>
          <Link href="/privacy" className="hover:underline">
            Privacy &amp; disclaimer
          </Link>
        </div>
      </footer>
    </div>
  );
}
