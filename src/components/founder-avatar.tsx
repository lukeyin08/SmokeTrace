import { cn } from "@/lib/utils";

/**
 * Circular initials "bubble" used in place of a founder photo.
 */
export function FounderAvatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-400 font-bold text-primary-foreground",
        className
      )}
    >
      {initials}
    </div>
  );
}
