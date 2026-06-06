import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 text-primary-foreground shadow-sm">
        <Wind className="h-5 w-5" />
      </span>
      {showText && <span className="text-lg tracking-tight">SmokeTrace</span>}
    </span>
  );
}
