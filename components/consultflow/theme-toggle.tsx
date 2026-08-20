"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@kidzink/ui";

/**
 * Light/dark toggle (binary — not a 3-way system/light/dark picker).
 * `mounted` gates the rendered icon because the server has no access to
 * the browser's persisted/OS theme, so the real icon only swaps in
 * client-side, avoiding a hydration mismatch. Uses `resolvedTheme` (the
 * actual light-or-dark result), never `theme` (which could still be
 * "system"), so the icon is always a sun or a moon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deliberate: this is the standard next-themes hydration-mismatch
    // guard, not state genuinely synchronized with an external system —
    // there's nothing to subscribe to, just a one-time "client has
    // mounted" flip so the real icon can render once it's safe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
