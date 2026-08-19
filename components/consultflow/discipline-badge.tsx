import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge hues available for discipline tags — plain Tailwind color utilities
 * drawn directly from the Foundation → Colors categorical ramps
 * (Kidzink_Digital-Transformations Figma file), which are exact matches for
 * Tailwind's own stock palette (confirmed via the file's real Color Style
 * variables, not just a visual read).
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
  gray: "bg-neutral-200 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400",
} as const;

type Hue = keyof typeof HUE_CLASSNAMES;

// Gray is reserved for the explicit Figma-matched disciplines below (it
// reads as "no color" rather than a categorical hue), so it's left out of
// the hash pool used for everything else.
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

/**
 * Explicit discipline → hue overrides, pulled from the literal Figma
 * component data (Kidzink_Digital-Transformations, node 499:6470 — the
 * dashboard table's 12 rows, the "9E Lorem" profile page's Disciplines
 * row, and its review cards), not a screenshot read — via get_design_context
 * on each cell-disciplines/Tags Area node. Every badge in the file actually
 * uses the {hue}/50 background + {hue}/700 text pairing (not /100+/800).
 * Keys are matched case-insensitively; anything not listed here still falls
 * back to the deterministic hash below. Since these are hardcoded against
 * one snapshot of the mockup rather than a shared enum, a discipline whose
 * stored text differs even slightly (spacing/punctuation) from what's
 * listed here won't match — flag any mismatches and I'll add them.
 */
const FIGMA_DISCIPLINE_HUES: Record<string, Hue> = {
  aor: "pink",
  "structural eng.": "purple",
  "mep eng. + bms": "sky",
  "elv / av / it / ict": "rose",
  "civil eng. - roads": "yellow",
  "utilities & infrastructure": "orange",
  "fire-life safety eng.": "indigo",
  security: "gray",
  architecture: "blue",
  "roads & traffic (tis)": "orange",
  acoustics: "purple",
  "swimming pool": "sky",
  "theatre specialist": "rose",
  "soil investigation": "gray",
  topographical: "green",
  "façade engineering": "indigo",
  "cost consultancy": "yellow",
};

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
  const explicitHue = FIGMA_DISCIPLINE_HUES[key];
  if (explicitHue) return HUE_CLASSNAMES[explicitHue];
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
