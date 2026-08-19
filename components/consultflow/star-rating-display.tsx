import { FractionalStar } from "@/components/consultflow/star-icon";

export function StarRatingDisplay({
  value,
  label,
}: {
  /** 0-5, may be fractional (e.g. an average across reviews) — each star
   * fills proportionally rather than rounding to the nearest whole star. */
  value: number;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <FractionalStar key={n} fill={value - (n - 1)} className="size-4" />
        ))}
      </div>
    </div>
  );
}
