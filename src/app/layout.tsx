import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "EventPass — Mobile-First Ticketing App",
  description: "Showcase ticketing app with signed QR codes, offline scanner, and AI assistant.",
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('eventpass-theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && systemDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
