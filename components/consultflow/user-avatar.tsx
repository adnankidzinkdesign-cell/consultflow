import { cn } from "@/lib/utils";

/**
 * Initials-based avatar circle (Kidzink_Digital-Transformations Figma file
 * shows a real profile photo — profiles don't store one, so this is a
 * placeholder built from the display name rather than pulling a photo from
 * Microsoft Graph, which is a bigger integration out of scope here).
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
