"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Countdown "urge timer". Cravings typically crest and fall within a few
 * minutes: riding out the timer is itself the intervention.
 */
export function UrgeTimer({
  seconds = 300,
  onComplete,
  className,
}: {
  seconds?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [remaining, setRemaining] = React.useState(seconds);
  const [running, setRunning] = React.useState(true);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onComplete]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((seconds - remaining) / seconds) * 100;
  const done = remaining === 0;

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative h-56 w-56">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="12"
            className="stroke-primary/15"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-primary transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {done ? "You made it through" : "Stay with it"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {!done && (
          <Button
            variant="outline"
            onClick={() => setRunning((r) => !r)}
            className="gap-2"
          >
            {running ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Resume
              </>
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            completedRef.current = false;
            setRemaining(seconds);
            setRunning(true);
          }}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" /> Restart
        </Button>
      </div>
    </div>
  );
}
