import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge hues available for discipline tags, sourced from the KidzInk
 * design-system foundation (Kidzink_Digital-Transformations Figma file,
 * Foundation → Colors). Disciplines are free text (no fixed enum), so each
 * name is deterministically hashed to one of these hues rather than mapped
 * by hand — the same discipline always renders in the same color everywhere
 * it appears (dashboard table, profile page, review cards).
 */
const DISCIPLINE_HUE_CLASSES = [
  "bg-[color:var(--color-red-soft)] text-[color:var(--color-red-ink)]",
  "bg-[color:var(--color-orange-soft)] text-[color:var(--color-orange-ink)]",
  "bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]",
  "bg-[color:var(--color-green-soft)] text-[color:var(--color-green-ink)]",
  "bg-[color:var(--color-sky-soft)] text-[color:var(--color-sky-ink)]",
  "bg-[color:var(--color-blue-soft)] text-[color:var(--color-blue-ink)]",
  "bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-ink)]",
  "bg-[color:var(--color-pink-soft)] text-[color:var(--color-pink-ink)]",
  "bg-[color:var(--color-rose-soft)] text-[color:var(--color-rose-ink)]",
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
    <Badge variant="outline" className={cn(disciplineBadgeClassName(discipline), className)}>
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
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          +{overflow}
        </Badge>
      )}
    </div>
  );
}
