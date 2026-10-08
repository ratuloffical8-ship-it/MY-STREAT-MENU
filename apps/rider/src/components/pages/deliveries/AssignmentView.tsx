// apps/rider/src/components/pages/deliveries/AssignmentView.tsx
"use client";

import { useState } from "react";
import { ProblemSheet } from "@/components/pages/deliveries/ProblemSheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { useStartDelivery } from "@/hooks/useDelivery";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";
import type { Delivery } from "@/types/delivery";

/** Screen 2: a new task. Distance, time, pickup, drop-off, one big button. */
export function AssignmentView({ delivery }: { delivery: Delivery }) {
  const { t, language } = useTranslation();
  const start = useStartDelivery();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Card tone="brand" className="flex flex-col gap-4 border-2">
        <div className="flex items-center justify-between gap-2">
          <CardLabel>{t("assignment.newAssignment")}</CardLabel>
          <Badge tone="navy">#{delivery.orderCode}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-muted">{t("assignment.distance")}</p>
            <p className="text-2xl font-bold text-navy">
              {formatDistance(delivery.distanceKm, language)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-muted">{t("assignment.time")}</p>
            <p className="text-2xl font-bold text-navy">
              {formatDuration(delivery.estimatedMinutes, language)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-brand-200 pt-3">
          <CardLabel>{t("assignment.pickup")}</CardLabel>
          <p className="text-xl font-bold text-navy">{delivery.restaurant.name}</p>
          <p className="text-base text-muted">{delivery.restaurant.area}</p>
        </div>

        <div className="flex flex-col gap-1 border-t border-brand-200 pt-3">
          <CardLabel>{t("assignment.dropoff")}</CardLabel>
          <p className="text-xl font-bold text-navy">{t("assignment.customerAddress")}</p>
          <p className="text-base text-muted">{delivery.customer.area}</p>
        </div>
      </Card>

      {start.isError ? (
        <p role="alert" className="text-base font-semibold text-danger-700">
          {t("common.notSavedRetry")}
        </p>
      ) : null}

      <Button
        size="lg"
        fullWidth
        loading={start.isPending}
        onClick={() => start.mutate(delivery.id)}
      >
        {t("assignment.start")}
      </Button>

      <Button variant="ghost" fullWidth onClick={() => setReportOpen(true)}>
        {t("common.reportProblem")}
      </Button>

      <ProblemSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        deliveryId={delivery.id}
        stage="pickup"
      />
    </div>
  );
      }
