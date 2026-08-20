"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kidzink/ui";
import {
  CONSULTANT_STATUS_OPTIONS,
  CONSULTANT_TIER_OPTIONS,
} from "@/components/consultflow/status-badges";
import { updateConsultantStatusAndTier } from "@/lib/actions/consultants";
import type { ConsultantStatus, ConsultantTier } from "@/lib/supabase/types";

const STATUS_LABELS = Object.fromEntries(
  CONSULTANT_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<ConsultantStatus, string>;
const TIER_LABELS = Object.fromEntries(
  CONSULTANT_TIER_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<ConsultantTier, string>;

/**
 * Inline, auto-saving Tier/Status editing on the consultant detail page
 * (Admin View, Kidzink_Digital-Transformations Figma file) — an admin-only
 * shortcut so a quick status/tier change doesn't require opening the full
 * Edit modal. Replaces the static ConsultantStatusBadge/TierBadge pair
 * shown to non-admins (see ConsultantDetailPage).
 */
export function ConsultantQuickEdit({
  consultantId,
  status: initialStatus,
  tier: initialTier,
}: {
  consultantId: string;
  status: ConsultantStatus;
  tier: ConsultantTier;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [tier, setTier] = useState(initialTier);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save(nextStatus: ConsultantStatus, nextTier: ConsultantTier) {
    const previousStatus = status;
    const previousTier = tier;
    // Optimistic update — reverted below if the save fails.
    setStatus(nextStatus);
    setTier(nextTier);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateConsultantStatusAndTier(consultantId, nextStatus, nextTier);
      if (result.error) {
        setStatus(previousStatus);
        setTier(previousTier);
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="max-w-xs space-y-2">
      <Select
        value={tier}
        onValueChange={(next) => next && save(status, next as ConsultantTier)}
      >
        <SelectTrigger className="w-full" disabled={isPending}>
          <SelectValue>{(value: ConsultantTier) => TIER_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CONSULTANT_TIER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(next) => next && save(next as ConsultantStatus, tier)}
      >
        <SelectTrigger className="w-full" disabled={isPending}>
          <SelectValue>{(value: ConsultantStatus) => STATUS_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CONSULTANT_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex h-4 items-center gap-1.5 text-xs">
        {isPending && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Saving…
          </span>
        )}
        {!isPending && saved && (
          <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
            <CheckIcon className="size-3" />
            Saved
          </span>
        )}
        {!isPending && error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}
