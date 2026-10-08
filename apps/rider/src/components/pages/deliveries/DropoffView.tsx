// apps/rider/src/components/pages/deliveries/DropoffView.tsx
"use client";

import { useState } from "react";
import { ArrivedButton } from "@/components/pages/deliveries/ArrivedButton";
import { ProblemSheet } from "@/components/pages/deliveries/ProblemSheet";
import { VerificationInput } from "@/components/pages/deliveries/VerificationInput";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { StepTracker } from "@/components/ui/StepTracker";
import { DELIVERY_OTP_LENGTH } from "@/config/constants";
import { useConfirmDelivery, useMarkArrived } from "@/hooks/useDelivery";
import { useGeofence } from "@/hooks/useGeofence";
import { toTelUrl, formatNumber } from "@/lib/formatters";
import { buildDirectionsUrl } from "@/lib/geo";
import { useTranslation } from "@/providers/LanguageProvider";
import { ApiError } from "@/services/api";
import type { Delivery, VerificationMethod } from "@/types/delivery";

/** Screen 4: go to the customer, hand over the order, confirm delivery. */
export function DropoffView({ delivery }: { delivery: Delivery }) {
  const { t, language } = useTranslation();
  const arrive = useMarkArrived();
  const confirm = useConfirmDelivery();
  const geofence = useGeofence(delivery.customer.point);

  const [reportOpen, setReportOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const { customer } = delivery;

  // Contactless deliveries always need the doorstep photo
  const method: VerificationMethod = delivery.isContactless
    ? "photo"
    : delivery.verification;

  const proofReady =
    method === "tap" ||
    (method === "otp" && otp.length === DELIVERY_OTP_LENGTH) ||
    (method === "photo" && photo !== null);

  const point = geofence.point;
  const canConfirm = geofence.status === "inside" && point !== null && proofReady;

  const wrongCode =
    method === "otp" &&
    confirm.error instanceof ApiError &&
    confirm.error.status === 400;

  function handleConfirm() {
    if (!canConfirm || point === null) return;
    confirm.mutate({
      deliveryId: delivery.id,
      location: point,
      method,
      otp: method === "otp" ? otp : undefined,
      photoDataUrl: method === "photo" && photo !== null ? photo : undefined,
    });
  }

  function openDirections() {
    window.open(buildDirectionsUrl(customer.point), "_blank", "noopener,noreferrer");
  }

  let geofenceText: string;
  switch (geofence.status) {
    case "inside":
      geofenceText = t("geofence.ok");
      break;
    case "outside":
      geofenceText = t("geofence.tooFar", {
        meters: formatNumber(Math.round(geofence.distanceMeters ?? 0), language),
        radius: formatNumber(geofence.radiusMeters, language),
      });
      break;
    case "denied":
      geofenceText = t("geofence.denied");
      break;
    case "unavailable":
      geofenceText = t("geofence.unavailable");
      break;
    default:
      geofenceText = t("geofence.checking");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-bold text-navy">
          {t("pickup.deliveryLabel", { code: delivery.orderCode })}
        </p>
        <Badge tone="brand" dot>
          {t("dropoff.badge")}
        </Badge>
      </div>

      <StepTracker
        current="dropoff"
        labels={{
          pickup: t("steps.pickup"),
          dropoff: t("steps.dropoff"),
          complete: t("steps.complete"),
        }}
      />

      <Card className="flex flex-col gap-3">
        <CardLabel>{t("dropoff.title")}</CardLabel>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-navy">{customer.name}</p>
          <p className="text-base text-muted">{customer.address}</p>
        </div>
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<span aria-hidden="true">📍</span>}
          onClick={openDirections}
        >
          {t("pickup.openDirections")}
        </Button>
        {customer.callBridgeNumber ? (
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<span aria-hidden="true">📞</span>}
            onClick={() =>
              window.location.assign(toTelUrl(customer.callBridgeNumber ?? ""))
            }
          >
            {t("dropoff.callCustomer")}
          </Button>
        ) : null}
      </Card>

      {customer.deliveryInstructions ? (
        <Card className="flex flex-col gap-1">
          <CardLabel>{t("dropoff.instructionsTitle")}</CardLabel>
          <p className="text-base text-navy">{customer.deliveryInstructions}</p>
        </Card>
      ) : null}

      <ArrivedButton
        arrived={delivery.arrivedAtCustomerAt !== null}
        isPending={arrive.isPending}
        hasError={arrive.isError}
        sentMessage={t("arrived.sentCustomer")}
        onPress={() => arrive.mutate({ deliveryId: delivery.id, at: "customer" })}
      />

      <Card tone="brand" className="flex flex-col gap-3">
        <CardLabel>{t("dropoff.atLocation")}</CardLabel>
        <p className="text-base text-navy">{t("dropoff.atLocationHint")}</p>

        <p
          aria-live="polite"
          className={
            geofence.status === "inside"
              ? "text-base font-bold text-ok-700"
              : geofence.status === "checking"
                ? "text-base font-semibold text-muted"
                : "text-base font-bold text-danger-700"
          }
        >
          {geofenceText}
        </p>

        {method !== "tap" ? (
          <VerificationInput
            method={method}
            otp={otp}
            onOtpChange={setOtp}
            photo={photo}
            onPhotoChange={setPhoto}
            disabled={confirm.isPending}
            hasError={wrongCode}
          />
        ) : null}

        {confirm.isError ? (
          <p role="alert" className="text-base font-semibold text-danger-700">
            {wrongCode ? t("auth.invalidOtp") : t("common.notSavedRetry")}
          </p>
        ) : null}

        <Button
          size="lg"
          fullWidth
          disabled={!canConfirm}
          loading={confirm.isPending}
          onClick={handleConfirm}
        >
          {t("dropoff.confirm")}
        </Button>
      </Card>

      <Button variant="ghost" fullWidth onClick={() => setReportOpen(true)}>
        {t("dropoff.reportProblem")}
      </Button>

      <ProblemSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        deliveryId={delivery.id}
        stage="dropoff"
      />
    </div>
  );
}
