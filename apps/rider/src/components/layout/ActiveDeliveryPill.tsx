// apps/rider/src/components/layout/ActiveDeliveryPill.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES, deliveryPath } from "@/config/constants";
import { useActiveDelivery } from "@/hooks/useActiveDelivery";
import { useTranslation } from "@/providers/LanguageProvider";

/** Pages that already show the delivery, so the pill is not needed there. */
function isDeliveryPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === ROUTES.home ||
    pathname === ROUTES.deliveries ||
    pathname.startsWith(`${ROUTES.deliveries}/`)
  );
}

/**
 * Floating pill above the bottom tabs: from History, Earnings or Profile,
 * the rider gets back to the active delivery with one tap.
 */
export function ActiveDeliveryPill() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: delivery } = useActiveDelivery();

  if (!delivery || isDeliveryPage(pathname)) return null;

  return (
    <Link
      href={deliveryPath(delivery.id)}
      className="fixed inset-x-4 z-30 mx-auto flex min-h-touch max-w-md items-center justify-between gap-3 rounded-full bg-navy px-5 text-base font-bold text-white shadow-card"
      style={{
        bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px) + 0.75rem)",
      }}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-brand" />
        #{delivery.orderCode}
      </span>
      <span className="flex items-center gap-1">
        {t("home.continueDelivery")}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
