import { Badge } from "@/components/ui/badge";
import type {
  ChecklistStatus,
  ConsultantStatus,
  ConsultantTier,
} from "@/lib/supabase/types";

const CONSULTANT_STATUS_CONFIG: Record<
  ConsultantStatus,
  { label: string; className: string }
> = {
  pending_review: {
    label: "Pending review",
    className: "bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  },
  rejected: { label: "Rejected", className: "" },
  suspended: {
    label: "Suspended",
    className: "bg-muted text-muted-foreground",
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
    <Badge variant={status === "rejected" ? "destructive" : "outline"} className={config.className}>
      {config.label}
    </Badge>
  );
}

const TIER_CONFIG: Record<ConsultantTier, { label: string; className: string }> = {
  tier_1: {
    label: "Tier 1",
    className: "bg-[color:var(--color-purple-soft)] text-[color:var(--color-purple-ink)]",
  },
  tier_2: {
    label: "Tier 2",
    className: "bg-[color:var(--color-amber-soft)] text-[color:var(--color-amber-ink)]",
  },
  tier_3: {
    label: "Tier 3",
    className: "bg-[color:var(--color-pink-soft)] text-[color:var(--color-pink-ink)]",
  },
  unrated: { label: "Unrated", className: "bg-muted text-muted-foreground" },
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
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

const CHECKLIST_STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; className: string }
> = {
  not_submitted: { label: "Not submitted", className: "bg-muted text-muted-foreground" },
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
    <Badge variant={isDestructive ? "destructive" : "outline"} className={config.className}>
      {config.label}
    </Badge>
  );
}
