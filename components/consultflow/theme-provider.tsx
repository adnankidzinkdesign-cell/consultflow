"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

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
