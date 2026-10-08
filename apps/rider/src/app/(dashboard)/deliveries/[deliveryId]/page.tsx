// apps/rider/src/app/(dashboard)/deliveries/[deliveryId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { AssignmentView } from "@/components/pages/deliveries/AssignmentView";
import { CompletedView } from "@/components/pages/deliveries/CompletedView";
import { DropoffView } from "@/components/pages/deliveries/DropoffView";
import { PickupView } from "@/components/pages/deliveries/PickupView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/config/constants";
import { useDelivery } from "@/hooks/useDelivery";
import { useTranslation } from "@/providers/LanguageProvider";
import { ApiError } from "@/services/api";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** One delivery: shows the screen that matches where the rider is in the journey. */
export default function DeliveryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useParams<{ deliveryId: string }>();
  const deliveryId = safeDecode(params.deliveryId);

  const query = useDelivery(deliveryId);
  const delivery = query.data;

  // Nothing to show yet. (If a background refresh fails while we already have
  // the delivery, we keep showing it instead of replacing the screen.)
  if (delivery === undefined) {
    if (query.isError) {
      const notFound = query.error instanceof ApiError && query.error.status === 404;
      return (
        <Card tone="danger" className="flex flex-col gap-3">
          <p role="alert" className="text-lg font-bold text-danger-700">
            {notFound ? t("errors.notFoundTitle") : t("errors.generic")}
          </p>
          {notFound ? (
            <p className="text-base text-navy">{t("errors.notFoundHint")}</p>
          ) : null}
          {notFound ? (
            <Button variant="secondary" fullWidth onClick={() => router.push(ROUTES.home)}>
              {t("errors.goHome")}
            </Button>
          ) : (
            <Button variant="secondary" fullWidth onClick={() => void query.refetch()}>
              {t("common.retry")}
            </Button>
          )}
        </Card>
      );
    }

    return (
      <Card className="flex items-center justify-center py-10" aria-busy="true">
        <Spinner size="lg" label={t("common.loading")} />
      </Card>
    );
  }

  switch (delivery.status) {
    case "assigned":
      return <AssignmentView delivery={delivery} />;
    case "to_pickup":
      return <PickupView delivery={delivery} />;
    case "to_dropoff":
      return <DropoffView delivery={delivery} />;
    case "completed":
      return <CompletedView delivery={delivery} />;
    case "cancelled":
      return (
        <Card className="flex flex-col gap-3">
          <p className="text-xl font-bold text-navy">{t("status.cancelled")}</p>
          <Button size="lg" fullWidth onClick={() => router.push(ROUTES.home)}>
            {t("completed.backHome")}
          </Button>
        </Card>
      );
  }
}
