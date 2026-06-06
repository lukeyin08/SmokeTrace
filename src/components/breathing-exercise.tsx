"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Phase = "inhale" | "hold" | "exhale";

const PHASES: { phase: Phase; label: string; seconds: number }[] = [
  { phase: "inhale", label: "Breathe in", seconds: 4 },
  { phase: "hold", label: "Hold", seconds: 4 },
  { phase: "exhale", label: "Breathe out", seconds: 6 },
];

/**
 * A calm box-breathing guide (4-4-6). Purely visual / self-paced: helps users
 * down-regulate during a craving.
 */
export function BreathingExercise({ className }: { className?: string }) {
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(PHASES[0].seconds);

  React.useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setIndex((i) => (i + 1) % PHASES.length);
        return PHASES[(indexRef.current + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // keep a ref so the interval reads the latest index without resubscribing
  const indexRef = React.useRef(index);
  React.useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const current = PHASES[index];
  const scale =
    current.phase === "inhale"
      ? "scale-110"
      : current.phase === "hold"
      ? "scale-110"
      : "scale-90";

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
        <div
          className={cn(
            "flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-teal-400 text-primary-foreground shadow-xl transition-transform [transition-duration:3000ms] ease-in-out",
            scale
          )}
        >
          <div className="text-center">
            <p className="text-lg font-semibold">{current.label}</p>
            <p className="text-4xl font-bold tabular-nums">{count}</p>
          </div>
        </div>
      </div>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        Follow the circle. In for 4, hold for 4, out for 6. Let each exhale carry
        the urge a little further away.
      </p>
    </div>
  );
}
