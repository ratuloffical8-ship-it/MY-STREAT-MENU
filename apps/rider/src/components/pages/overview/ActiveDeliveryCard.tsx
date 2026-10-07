// apps/rider/src/components/pages/overview/ActiveDeliveryCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { deliveryPath } from "@/config/constants";
import { formatDistance, formatDuration, formatMoney } from "@/lib/formatters";
import type { TranslationKey } from "@/lib/i18n";
import { useTranslation } from "@/providers/LanguageProvider";
import type { Delivery, DeliveryStatus } from "@/types/delivery";

const STATUS_LABEL_KEYS: Record<DeliveryStatus, TranslationKey> = {
  assigned: "status.assigned",
  to_pickup: "status.toPickup",
  to_dropoff: "status.toDropoff",
  completed: "status.completed",
  cancelled: "status.cancelled",
};

/** The task card at the top of Home while a delivery is in progress. */
export function ActiveDeliveryCard({ delivery }: { delivery: Delivery }) {
  const router = useRouter();
  const { t, language } = useTranslation();

  const isNew = delivery.status === "assigned";

  return (
    <Card tone="brand" className="flex flex-col gap-3 border-2">
      <div className="flex items-center justify-between gap-2">
        <CardLabel>
          {isNew ? t("assignment.newAssignment") : t("home.activeDelivery")}
        </CardLabel>
        <Badge tone="navy">#{delivery.orderCode}</Badge>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xl font-bold text-navy">{delivery.restaurant.name}</p>
        <p className="text-base text-muted">
          {delivery.restaurant.area} → {delivery.customer.area}
        </p>
        <Badge tone="brand" dot className="mt-1 self-start">
          {t(STATUS_LABEL_KEYS[delivery.status])}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-base font-semibold text-navy">
        <span>{formatDistance(delivery.distanceKm, language)}</span>
        <span aria-hidden="true">·</span>
        <span>{formatDuration(delivery.estimatedMinutes, language)}</span>
        <span className="ms-auto text-lg font-bold text-brand-700">
          {formatMoney(delivery.earning, language)}
        </span>
      </div>

      <Button
        size="lg"
        fullWidth
        onClick={() => router.push(deliveryPath(delivery.id))}
      >
        {isNew ? t("assignment.start") : t("home.continueDelivery")}
      </Button>
    </Card>
  );
}

/** Shown on Home when there is no delivery. */
export function NoActiveDeliveryCard({ online }: { online: boolean }) {
  const { t } = useTranslation();

  return (
    <Card tone="muted" className="flex flex-col gap-1">
      <p className="text-lg font-bold text-navy">{t("home.noActive")}</p>
      <p className="text-base text-muted">
        {online ? t("home.noActiveHint") : t("home.offlineHint")}
      </p>
    </Card>
  );
          }
