import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge hues available for discipline tags — plain Tailwind color utilities
 * drawn directly from the Foundation → Colors categorical ramps
 * (Kidzink_Digital-Transformations Figma file), which are exact matches for
 * Tailwind's own stock palette (confirmed via the file's real Color Style
 * variables, not just a visual read). Disciplines are decorative/arbitrary
 * (free text, no fixed enum) rather than a status meaning, so — unlike the
 * Approved/Pending review/Rejected/Suspended status badges, which keep their
 * own fixed semantic colors — each name is deterministically hashed to one
 * of these; the same discipline always renders in the same color everywhere
 * it appears (dashboard table, profile page, review cards).
 */
const DISCIPLINE_HUE_CLASSES = [
  "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400",
  "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400",
  "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-400",
  "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
] as const;

/** Deterministic string hash (djb2) so hue assignment is stable across renders/sessions. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function disciplineBadgeClassName(discipline: string): string {
  const index = hashString(discipline.trim().toLowerCase()) % DISCIPLINE_HUE_CLASSES.length;
  return DISCIPLINE_HUE_CLASSES[index];
}

export function DisciplineBadge({
  discipline,
  className,
}: {
  discipline: string;
  className?: string;
}) {
  return (
    <Badge className={cn(disciplineBadgeClassName(discipline), className)}>
      {/* Ellipsis truncation needs a block-level text context — Badge is
          inline-flex, and text-overflow:ellipsis doesn't reliably apply to a
          flex container's direct text child, so the name gets its own inner
          span (min-w-0 lets it actually shrink inside the flex row). */}
      <span className="min-w-0 truncate">{discipline}</span>
    </Badge>
  );
}

/**
 * Renders up to `max` discipline badges plus a "+N" overflow badge for the
 * rest, matching the collapsed-row state in the Figma dashboard mockups
 * (Kidzink_Digital-Transformations, node 499:6470). Omit `max` to render
 * every discipline (used on the consultant detail page).
 */
export function DisciplineBadgeList({
  disciplines,
  max,
  badgeClassName,
}: {
  disciplines: string[];
  max?: number;
  badgeClassName?: string;
}) {
  if (disciplines.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  const visible = max ? disciplines.slice(0, max) : disciplines;
  const overflow = disciplines.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((discipline) => (
        <DisciplineBadge key={discipline} discipline={discipline} className={badgeClassName} />
      ))}
      {overflow > 0 && (
        <Badge className="bg-neutral-200 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400">
          +{overflow}
        </Badge>
      )}
    </div>
  );
}
