// apps/rider/src/components/pages/deliveries/CompletedView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/config/constants";
import { formatDateTime, formatDistance, formatMoney } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";
import type { Delivery } from "@/types/delivery";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-base text-muted">{label}</dt>
      <dd className="text-base font-bold text-navy">{value}</dd>
    </div>
  );
}

/** Screen 5: delivery finished, money credited. */
export function CompletedView({ delivery }: { delivery: Delivery }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [showSummary, setShowSummary] = useState(false);

  const dash = "—";

  return (
    <div className="flex flex-col gap-5 pt-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span aria-hidden="true" className="text-6xl">
          ✅
        </span>
        <h1 className="text-2xl font-bold text-navy">{t("completed.title")}</h1>
        <p className="text-base text-muted">
          {t("completed.message", { code: delivery.orderCode })}
        </p>
      </div>

      <Card tone="ok">
        <dl className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-base text-muted">{t("completed.earning")}</dt>
            <dd className="text-2xl font-bold text-ok-700">
              {formatMoney(delivery.earning, language)}
            </dd>
          </div>
          {delivery.tip > 0 ? (
            <Row label={t("earnings.tips")} value={formatMoney(delivery.tip, language)} />
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-base text-muted">{t("completed.status")}</dt>
            <dd>
              <Badge tone="ok" dot>
                {t("completed.statusCompleted")}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <Button size="lg" fullWidth onClick={() => router.push(ROUTES.home)}>
        {t("completed.backHome")}
      </Button>

      <Button variant="ghost" fullWidth onClick={() => setShowSummary((open) => !open)}>
        {showSummary ? t("common.close") : t("completed.viewSummary")}
      </Button>

      {showSummary ? (
        <Card>
          <dl className="flex flex-col gap-2">
            <Row label={t("assignment.pickup")} value={delivery.restaurant.name} />
            <Row
              label={t("completed.pickedUp")}
              value={delivery.pickedUpAt ? formatDateTime(delivery.pickedUpAt, language) : dash}
            />
            <Row
              label={t("completed.delivered")}
              value={delivery.deliveredAt ? formatDateTime(delivery.deliveredAt, language) : dash}
            />
            <Row
              label={t("assignment.distance")}
              value={formatDistance(delivery.distanceKm, language)}
            />
          </dl>
        </Card>
      ) : null}
    </div>
  );
}
