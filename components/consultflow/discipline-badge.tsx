import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge hues available for discipline tags — plain Tailwind color utilities
 * drawn directly from the Foundation → Colors categorical ramps
 * (Kidzink_Digital-Transformations Figma file), which are exact matches for
 * Tailwind's own stock palette (confirmed via the file's real Color Style
 * variables, not just a visual read) — the {hue}/50 background + {hue}/700
 * text pairing is what every badge in the file actually uses.
 *
 * Disciplines are free text (no fixed enum), so each name is deterministically
 * hashed to one of these rather than mapped by hand — the same discipline
 * always renders in the same color everywhere it appears (dashboard table,
 * profile page, review cards).
 */
const HUE_CLASSNAMES = {
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  green: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  pink: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
} as const;

type Hue = keyof typeof HUE_CLASSNAMES;

const HASH_POOL: Hue[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "sky",
  "blue",
  "indigo",
  "purple",
  "pink",
  "rose",
];

/** Deterministic string hash (djb2) so hue assignment is stable across renders/sessions. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function disciplineBadgeClassName(discipline: string): string {
  const key = discipline.trim().toLowerCase();
  const hue = HASH_POOL[hashString(key) % HASH_POOL.length];
  return HUE_CLASSNAMES[hue];
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
