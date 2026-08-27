"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes renders its flash-of-unstyled-theme-prevention snippet as a
 * real inline <script> element (not next/script) so it runs synchronously
 * before paint — see node_modules/next-themes/dist/index.mjs. React 19
 * warns on any <script> a component renders, which is a false positive
 * here: the tag comes through in the raw SSR HTML, so the browser executes
 * it on initial parse same as ever: no flash, nothing silently broken.
 * next-themes hasn't shipped a fix (no release since ~March 2025 — see
 * https://github.com/pacocoursey/next-themes/issues/387), so filter just
 * this one message rather than replace an otherwise-working library.
 */
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering")
    ) {
      return;
    }
    originalError(...args);
  };
}

/**
 * Thin client-component wrapper so app/layout.tsx (a Server Component) can
 * mount next-themes' provider. `attribute="class"` toggles the `.dark`
 * class on <html>, matching app/globals.css's `@custom-variant dark
 * (&:is(.dark *))` — same mechanism as scorecard's theme switching.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
