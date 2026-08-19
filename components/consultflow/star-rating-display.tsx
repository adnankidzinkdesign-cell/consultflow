import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingDisplay({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon
            key={n}
            className={cn(
              "size-4 fill-current",
              n <= value ? "text-[color:var(--color-amber)]" : "text-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
