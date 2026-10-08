// apps/rider/src/components/pages/deliveries/PickupView.tsx
"use client";

import { useState } from "react";
import { ArrivedButton } from "@/components/pages/deliveries/ArrivedButton";
import { OrderReadyTimer } from "@/components/pages/deliveries/OrderReadyTimer";
import { ProblemSheet } from "@/components/pages/deliveries/ProblemSheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { StepTracker } from "@/components/ui/StepTracker";
import { useConfirmPickup, useMarkArrived } from "@/hooks/useDelivery";
import { buildDirectionsUrl } from "@/lib/geo";
import { useTranslation } from "@/providers/LanguageProvider";
import type { Delivery } from "@/types/delivery";

/** Screen 3: go to the restaurant, collect the order, confirm pickup. */
export function PickupView({ delivery }: { delivery: Delivery }) {
  const { t } = useTranslation();
  const arrive = useMarkArrived();
  const confirm = useConfirmPickup();
  const [reportOpen, setReportOpen] = useState(false);

  const { restaurant } = delivery;
  const instructions =
    restaurant.pickupInstructions ??
    t("pickup.defaultInstructions", { code: delivery.orderCode });

  function openDirections() {
    window.open(
      buildDirectionsUrl(restaurant.point),
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold text-navy">
          {t("pickup.deliveryLabel", { code: delivery.orderCode })}
        </p>
        <Badge tone="brand" dot>
          {t("pickup.badge")}
        </Badge>
      </div>

      <StepTracker
        current="pickup"
        labels={{
          pickup: t("steps.pickup"),
          dropoff: t("steps.dropoff"),
          complete: t("steps.complete"),
        }}
      />

      <Card className="flex flex-col gap-3">
        <CardLabel>{t("pickup.title")}</CardLabel>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-navy">{restaurant.name}</p>
          <p className="text-base text-muted">{restaurant.address}</p>
        </div>
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<span aria-hidden="true">📍</span>}
          onClick={openDirections}
        >
          {t("pickup.openDirections")}
        </Button>
      </Card>

      <OrderReadyTimer readyAt={restaurant.readyAt} />

      <Card className="flex flex-col gap-1">
        <CardLabel>{t("pickup.instructionsTitle")}</CardLabel>
        <p className="text-base text-navy">{instructions}</p>
      </Card>

      <ArrivedButton
        arrived={delivery.arrivedAtRestaurantAt !== null}
        isPending={arrive.isPending}
        hasError={arrive.isError}
        sentMessage={t("arrived.sentRestaurant")}
        onPress={() => arrive.mutate({ deliveryId: delivery.id, at: "restaurant" })}
      />

      <Card tone="brand" className="flex flex-col gap-3">
        <CardLabel>{t("pickup.afterCollecting")}</CardLabel>
        <p className="text-base text-navy">{t("pickup.afterHint")}</p>

        {confirm.isError ? (
          <p role="alert" className="text-base font-semibold text-danger-700">
            {t("common.notSavedRetry")}
          </p>
        ) : null}

        <Button
          size="lg"
          fullWidth
          loading={confirm.isPending}
          onClick={() => confirm.mutate(delivery.id)}
        >
          {t("pickup.confirm")}
        </Button>
      </Card>

      <Button variant="ghost" fullWidth onClick={() => setReportOpen(true)}>
        {t("pickup.reportProblem")}
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
