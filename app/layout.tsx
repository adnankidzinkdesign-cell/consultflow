import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/consultflow/theme-provider";
import "./globals.css";

// KidzInk's brand typeface (see D:\codebase\creator2's quotation
// document). `variable` is intentionally named to match what
// app/globals.css's @theme block expects for the `font-sans` utility —
// a mismatched name here silently falls back to the default font stack.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConsultFlow",
  description: "KidzInk consultant screening, review, and onboarding",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
