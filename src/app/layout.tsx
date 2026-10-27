import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventPass — Mobile-First Ticketing App",
  description: "Showcase ticketing app with signed QR codes, offline scanner, and AI assistant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
