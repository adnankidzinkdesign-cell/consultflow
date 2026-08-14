"use client";

import { usePathname } from "next/navigation";

const MODAL_ROUTE_PATTERNS = [/^\/consultants\/new$/, /^\/consultants\/[^/]+\/edit$/];

/**
 * Wraps the @modal parallel-route slot's rendered content. Needed because
 * of a Next.js gotcha: after a Server Action's redirect() (e.g. on
 * successful save), the target URL (/consultants/[id]) has no matching
 * segment under @modal, so Next.js's soft client-side navigation just
 * leaves that slot rendering its previous state instead of falling back to
 * default.tsx — the modal's <Dialog open> (hardcoded true in RouteModal)
 * never gets a signal to close, so it visually stays open.
 *
 * `usePathname()` reflects the real, current browser URL regardless of
 * what the (possibly stale) slot content is, so comparing against it lets
 * us force-hide the modal the moment we've navigated away from a
 * modal-eligible route — independent of whatever Next.js decided to do
 * with the slot's RSC payload.
 */
export function ModalSlot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isModalRoute = MODAL_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
  return isModalRoute ? children : null;
}
