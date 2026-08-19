import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ChecklistStatus,
  ConsultantStatus,
  ConsultantTier,
} from "@/lib/supabase/types";

/** Small colored circle inside a status-ish badge, per brand styling. */
function StatusDot({ className }: { className: string }) {
  return (
    <span
      data-icon="inline-start"
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", className)}
    />
  );
}

const CONSULTANT_STATUS_CONFIG: Record<
  ConsultantStatus,
  { label: string; className: string; dotClassName: string }
> = {
  pending_review: {
    label: "Pending review",
    className: "bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]",
    dotClassName: "bg-[color:var(--color-amber)]",
  },
  approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    dotClassName: "bg-green-500",
  },
  rejected: { label: "Rejected", className: "", dotClassName: "bg-destructive" },
  suspended: {
    label: "Suspended",
    className: "bg-neutral-50 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400",
    dotClassName: "bg-neutral-500",
  },
};

/**
 * Shared source for the Status <Select> options wherever status is
 * editable (the full edit form, and the inline quick-edit on the detail
 * page) — order and labels stay in sync with the badge above by construction.
 */
export const CONSULTANT_STATUS_OPTIONS: { value: ConsultantStatus; label: string }[] = (
  Object.keys(CONSULTANT_STATUS_CONFIG) as ConsultantStatus[]
).map((value) => ({ value, label: CONSULTANT_STATUS_CONFIG[value].label }));

export function ConsultantStatusBadge({ status }: { status: ConsultantStatus }) {
  const config = CONSULTANT_STATUS_CONFIG[status];
  return (
    <Badge variant={status === "rejected" ? "destructive" : undefined} className={config.className}>
      <StatusDot className={config.dotClassName} />
      {config.label}
    </Badge>
  );
}

/** Ad-hoc across the app (a boolean derived from reviews, not a persisted status) — kept as one shared component so the dot styling stays consistent. */
export function BlacklistedBadge() {
  return (
    <Badge variant="destructive">
      <StatusDot className="bg-destructive" />
      Blacklisted
    </Badge>
  );
}

// Tier is a categorical ranking, not a status meaning — like disciplines,
// its colors come straight from the Foundation → Colors ramps (plain
// Tailwind classes) rather than a fixed semantic choice. Tier 1's color
// (pink) is confirmed via the literal Figma dashboard-table data (two
// separate "Teir 1" badge instances, get_design_context on node 558:21749)
// — /50 + /700 is the pairing every badge in the file actually uses.
const TIER_CONFIG: Record<ConsultantTier, { label: string; className: string }> = {
  tier_1: {
    label: "Tier 1",
    className: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400",
  },
  tier_2: {
    label: "Tier 2",
    className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  },
  tier_3: {
    label: "Tier 3",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  },
  unrated: { label: "Unrated", className: "bg-neutral-200 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400" },
};

/**
 * Shared source for the Tier <Select> options (see CONSULTANT_STATUS_OPTIONS
 * above). Explicit order rather than derived from TIER_CONFIG's key order —
 * "Unrated" comes first here to match the existing edit form, whereas the
 * config above is ordered tier_1..tier_3, unrated.
 */
export const CONSULTANT_TIER_OPTIONS: { value: ConsultantTier; label: string }[] = [
  "unrated",
  "tier_1",
  "tier_2",
  "tier_3",
].map((value) => ({
  value: value as ConsultantTier,
  label: TIER_CONFIG[value as ConsultantTier].label,
}));

export function TierBadge({ tier }: { tier: ConsultantTier }) {
  const config = TIER_CONFIG[tier];
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

const CHECKLIST_STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; className: string }
> = {
  not_submitted: { label: "Not submitted", className: "bg-neutral-200 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400" },
  submitted: {
    label: "Submitted",
    className: "bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]",
  },
  verified: {
    label: "Verified",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  },
  rejected: { label: "Rejected", className: "" },
  expired: { label: "Expired", className: "" },
};

export function ChecklistStatusBadge({ status }: { status: ChecklistStatus }) {
  const config = CHECKLIST_STATUS_CONFIG[status];
  const isDestructive = status === "rejected" || status === "expired";
  return (
    <Badge variant={isDestructive ? "destructive" : undefined} className={config.className}>
      {config.label}
    </Badge>
  );
}
