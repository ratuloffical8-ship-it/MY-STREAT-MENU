// apps/rider/src/components/pages/deliveries/OrderReadyTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatCountdown } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";

/** Counts down to the time the restaurant said the order will be ready. */
export function OrderReadyTimer({ readyAt }: { readyAt: string | null }) {
  const { t, language } = useTranslation();

  const parsed = readyAt ? Date.parse(readyAt) : Number.NaN;
  const readyMs = Number.isNaN(parsed) ? null : parsed;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (readyMs === null) return;
    setNow(Date.now());
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= readyMs) clearInterval(timer); // ready: stop ticking
    }, 1000);
    return () => clearInterval(timer);
  }, [readyMs]);

  if (readyMs === null) {
    return (
      <Card tone="muted">
        <p className="text-base font-semibold text-muted">{t("orderReady.notSet")}</p>
      </Card>
    );
  }

  const remainingMs = readyMs - now;

  if (remainingMs <= 0) {
    return (
      <Card tone="ok">
        <p role="status" className="text-lg font-bold text-ok-700">
          ✓ {t("orderReady.ready")}
        </p>
      </Card>
    );
  }

  return (
    <Card tone="brand" className="flex items-center justify-between gap-3">
      <p className="text-base font-semibold text-navy">{t("orderReady.title")}</p>
      <p className="text-3xl font-bold tabular-nums text-brand-700">
        {formatCountdown(remainingMs, language)}
      </p>
    </Card>
  );
            }
