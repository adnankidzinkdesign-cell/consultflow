import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Star silhouette lifted from the Figma Star component (Kidzink_Digital-
 * Transformations, node 539:21116) rather than lucide-react's — same
 * currentColor/className conventions as any lucide icon, so it drops in
 * anywhere lucide's StarIcon was used.
 */
const STAR_PATH =
  "M9.53834 1.60996C9.70914 1.19932 10.2909 1.19932 10.4617 1.60996L12.5278 6.57744C12.5998 6.75056 12.7626 6.86885 12.9495 6.88383L18.3123 7.31376C18.7556 7.3493 18.9354 7.90256 18.5976 8.19189L14.5117 11.6919C14.3693 11.8139 14.3071 12.0053 14.3506 12.1876L15.5989 17.4208C15.7021 17.8534 15.2315 18.1954 14.8519 17.9635L10.2606 15.1592C10.1006 15.0615 9.89938 15.0615 9.73937 15.1592L5.14806 17.9635C4.76851 18.1954 4.29788 17.8534 4.40108 17.4208L5.64939 12.1876C5.69289 12.0053 5.6307 11.8139 5.48831 11.6919L1.40241 8.19189C1.06464 7.90256 1.24441 7.3493 1.68773 7.31376L7.05054 6.88383C7.23744 6.86885 7.40024 6.75056 7.47225 6.57744L9.53834 1.60996Z";

export function StarIcon({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

/**
 * One star cell with a fractional fill (0–1), matching the Figma Star
 * component's own mechanism: a muted background star, with a colored copy
 * of the same star laid on top and clip-path'd to reveal only the filled
 * portion — smooth partial fill (e.g. 0.4) rather than a plain on/off star,
 * and no distortion since the star shape itself is never resized, only
 * clipped.
 */
export function FractionalStar({
  fill,
  className,
}: {
  /** 0 (empty) to 1 (fully filled); values in between partially fill the star. */
  fill: number;
  className?: string;
}) {
  const percent = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <StarIcon className="absolute inset-0 size-full text-neutral-200 dark:text-neutral-700" />
      <StarIcon
        className="absolute inset-0 size-full text-yellow-400"
        style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
      />
    </span>
  );
}
