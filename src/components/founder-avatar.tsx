"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Founder photo with a graceful fallback to initials if the image is missing.
 * Drop the photo in at public/luke.jpg.
 */
export function FounderAvatar({ className }: { className?: string }) {
  const [errored, setErrored] = React.useState(false);

  if (errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-400 text-3xl font-bold text-primary-foreground",
          className
        )}
      >
        LY
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/luke.jpg"
      alt="Luke Yin, founder of SmokeTrace"
      onError={() => setErrored(true)}
      className={cn("rounded-2xl object-cover", className)}
    />
  );
}
