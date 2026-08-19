import { cn } from "@/lib/utils";

/**
 * Summary tiles above the consultants table (Kidzink_Digital-Transformations
 * Figma file, "Consultants Overview" dashboard mockup). Counts are computed
 * from the full, unfiltered consultant list — they describe the whole
 * pipeline, not whatever the table's client-side filters currently show.
 */
export function ConsultantMetrics({
  total,
  approved,
  pendingReview,
  blacklisted,
}: {
  total: number;
  approved: number;
  pendingReview: number;
  blacklisted: number;
}) {
  const metrics: { label: string; value: number; dotClassName?: string }[] = [
    { label: "Total consultants", value: total },
    { label: "Approved", value: approved, dotClassName: "bg-green-500" },
    { label: "Pending review", value: pendingReview },
    { label: "Blacklisted", value: blacklisted },
  ];

  return (
    <div className="flex flex-wrap gap-x-10 gap-y-3">
      {metrics.map((m) => (
        <div key={m.label} className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
          <p className="flex items-center gap-1.5 text-2xl font-semibold text-foreground">
            {m.value}
            {m.dotClassName && (
              <span className={cn("size-1.5 rounded-full", m.dotClassName)} aria-hidden="true" />
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
