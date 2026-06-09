import Link from "next/link";
import {
  Activity,
  ArrowRight,
  HeartHandshake,
  HeartPulse,
  Linkedin,
  LineChart,
  Mail,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FounderAvatar } from "@/components/founder-avatar";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

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
  {
    step: "1",
    title: "Set up your quit profile",
    description:
      "Share your smoking habits, your usual triggers, and your quit goal. It takes a couple of minutes and tailors everything that follows to you.",
  },
  {
    step: "2",
    title: "Log cravings in seconds",
    description:
      "Tap to capture a craving or a slip — when it hit, where you were, and how strong it felt. Each entry sharpens your personal trigger map.",
  },
  {
    step: "3",
    title: "Get support when it counts",
    description:
      "SmokeTrace surfaces your relapse risk, nudges you ahead of high-risk moments, and opens emergency mode or your accountability contacts when you need them.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Your cravings, triggers, and logs stay yours. No ads, and your data is never sold.",
  },
  {
    icon: HeartHandshake,
    title: "Always free",
    description:
      "A non-profit project built by students — no paywalls and no upsells, ever.",
  },
  {
    icon: Stethoscope,
    title: "Care, not claims",
    description:
      "Behavioral support designed to complement professional care, never replace it.",
  },
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
        <section className="relative overflow-hidden bg-app-gradient">
          {/* Decorative animated blobs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float-slow" />
            <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl animate-float-slower" />
            <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/30 blur-3xl animate-float-slow" />
          </div>
          <div className="container flex flex-col items-center py-20 text-center md:py-28">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Free for everyone, forever
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              Quit smoking. Predict cravings before they become relapses.
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
              SmokeTrace helps you beat nicotine addiction: track cravings, see
              your relapse risk, and get support before the next craving wins.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <Button asChild size="lg" className="gap-2">
                <Link href="/signup">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground animate-in fade-in duration-700 delay-500 fill-mode-both">
              Always free · Your data stays private
            </p>
          </div>
        </section>

        {/* Traction */}
        <section className="border-y bg-muted/30 py-10">
          <div className="container flex items-center justify-center gap-12 sm:gap-20">
            <div className="text-center">
              <p className="text-3xl font-bold tracking-tight text-primary">
                <CountUp value={100} suffix="+" />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Active users</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold tracking-tight text-primary">
                <CountUp value={5} prefix="$" suffix="k+" />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Raised so far</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container py-20">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to stay quit
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 80} className="h-full">
                  <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {f.description}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <Reveal>
              <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-balance text-center text-muted-foreground">
                Three simple steps from your first craving log to staying
                smoke-free.
              </p>
            </Reveal>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.step} delay={i * 120} className="h-full">
                  <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                        {s.step}
                      </div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why trust SmokeTrace */}
        <section className="container py-20">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Built on trust
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-center text-muted-foreground">
              SmokeTrace is here for one reason: to help you quit — on your
              terms.
            </p>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {TRUST.map((t, i) => {
              const Icon = t.icon;
              return (
                <Reveal key={t.title} delay={i * 100} className="h-full">
                  <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="flex flex-col items-center p-8 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold">{t.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {t.description}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Founders */}
        <section className="border-t py-20">
          <div className="container">
            <Reveal>
              <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
                Meet the Founders
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-balance text-center text-muted-foreground">
                The two students building SmokeTrace.
              </p>
            </Reveal>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Luke */}
              <Reveal className="h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <FounderAvatar
                      initials="LY"
                      className="h-24 w-24 text-3xl"
                    />
                    <p className="mt-4 font-semibold">Luke Yin</p>
                    <p className="text-sm text-muted-foreground">Co-Founder</p>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      Luke is a freshman at Princeton University studying
                      mathematics, with a minor in statistics and machine
                      learning. His work spans computational biology and
                      quantitative health analytics, including first-author
                      research on enzyme catalysis and predictive modeling of
                      community health data.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <a
                        href="mailto:ly3569@princeton.edu"
                        aria-label="Email Luke Yin"
                        title="ly3569@princeton.edu"
                        className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/lukeyin2008/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Luke Yin on LinkedIn"
                        title="LinkedIn"
                        className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Andrew */}
              <Reveal delay={120} className="h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <FounderAvatar
                      initials="AW"
                      className="h-24 w-24 text-3xl"
                    />
                    <p className="mt-4 font-semibold">Andrew Wong</p>
                    <p className="text-sm text-muted-foreground">Co-Founder</p>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      A sophomore at the University of Michigan, Andrew studies
                      neuroscience and public health. His work ranges from
                      computational neuroscience to adolescent sleep science and
                      digital preventative healthcare, including published
                      research on home-based EEG systems for public-health
                      telemonitoring.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <a
                        href="mailto:aawong@umich.edu"
                        aria-label="Email Andrew Wong"
                        title="aawong@umich.edu"
                        className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/andrewslinkedn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Andrew Wong on LinkedIn"
                        title="LinkedIn"
                        className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
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
