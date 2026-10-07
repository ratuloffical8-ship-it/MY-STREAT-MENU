// apps/rider/src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

// Hind Siliguri is designed for Bengali and also has Latin letters.
const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind",
});

export const metadata: Metadata = {
  title: {
    default: "MyStreetMenu Rider",
    template: "%s | MyStreetMenu Rider",
  },
  description: "MyStreetMenu delivery rider app. Your Menu. Everywhere.",
  applicationName: "MyStreetMenu Rider",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "MSM Rider",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F97316",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // lang is switched to "en" by LanguageProvider when the rider picks English
    <html lang="bn" className={hind.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-cream text-navy antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
  }
