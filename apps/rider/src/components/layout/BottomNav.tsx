// apps/rider/src/components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ReactNode } from "react";

export type NavKey = "home" | "history" | "earnings" | "profile";

export interface BottomNavProps {
  /** Translated tab names. */
  labels: Record<NavKey, string>;
}

interface NavItem {
  key: NavKey;
  href: string;
  /** The tab is highlighted when the current page is one of these (or inside them). */
  match: string[];
  icon: ReactNode;
}

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    href: "/overview",
    match: ["/overview", "/deliveries"],
    icon: (
      <SvgIcon>
        <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </SvgIcon>
    ),
  },
  {
    key: "history",
    href: "/delivery-history",
    match: ["/delivery-history"],
    icon: (
      <SvgIcon>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" />
      </SvgIcon>
    ),
  },
  {
    key: "earnings",
    href: "/earnings",
    match: ["/earnings"],
    icon: (
      <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center text-[1.4rem] font-bold leading-none">
        ৳
      </span>
    ),
  },
  {
    key: "profile",
    href: "/profile",
    match: ["/profile", "/support"],
    icon: (
      <SvgIcon>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </SvgIcon>
    ),
  },
];

function isActive(pathname: string | null, match: string[]): boolean {
  if (!pathname) return false;
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

/** Fixed bottom tabs: Home, History, Earnings, Profile. */
export function BottomNav({ labels }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex h-nav max-w-md">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex h-full min-h-touch flex-col items-center justify-center gap-1 text-xs font-bold",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy",
                  active ? "text-brand-700" : "text-muted"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-brand-600"
                  />
                ) : null}
                {item.icon}
                <span>{labels[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
        }
