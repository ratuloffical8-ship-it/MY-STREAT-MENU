// apps/rider/src/app/(dashboard)/layout.tsx
"use client";

import type { ReactNode } from "react";
import { ActiveDeliveryPill } from "@/components/layout/ActiveDeliveryPill";
import { BottomNav } from "@/components/layout/BottomNav";
import { useTranslation } from "@/providers/LanguageProvider";

/** Frame for every logged-in screen: content + active-delivery pill + bottom tabs. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="pt-safe min-h-dvh">
      <div className="pb-nav-safe mx-auto w-full max-w-md px-4 pt-4">{children}</div>

      <ActiveDeliveryPill />

      <BottomNav
        labels={{
          home: t("nav.home"),
          history: t("nav.history"),
          earnings: t("nav.earnings"),
          profile: t("nav.profile"),
        }}
      />
    </div>
  );
            }
