// apps/rider/src/app/(dashboard)/overview/page.tsx
"use client";

import { AvailabilityCard } from "@/components/pages/overview/AvailabilityCard";
import {
  ActiveDeliveryCard,
  NoActiveDeliveryCard,
} from "@/components/pages/overview/ActiveDeliveryCard";
import { TodaySummary } from "@/components/pages/overview/TodaySummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useActiveDelivery } from "@/hooks/useActiveDelivery";
import { useTodaySummary } from "@/hooks/useEarnings";
import { useRider, useSetAvailability } from "@/hooks/useRider";
import { getGreetingKey } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";

/** Home: next action first, everything else small and out of the way. */
export default function OverviewPage() {
  const { t } = useTranslation();

  const rider = useRider();
  const setAvailability = useSetAvailability();
  const activeDelivery = useActiveDelivery();
  const today = useTodaySummary();

  const availability = rider.data?.availability;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        {rider.data ? (
          // Greeting is built only after the data arrives (browser time), so
          // the server and browser never disagree about the text.
          <h1 className="text-2xl font-bold text-navy">
            {t(`greeting.${getGreetingKey()}`, { name: rider.data.name })}
          </h1>
        ) : (
          <div className="h-8 w-56 animate-pulse rounded bg-navy-100" />
        )}
        <p className="text-base text-muted">{t("greeting.riderAccount")}</p>
      </header>

      {/* Active task sticks to the top */}
      {activeDelivery.data ? (
        <ActiveDeliveryCard delivery={activeDelivery.data} />
      ) : null}

      {rider.isError && rider.data === undefined ? (
        <Card tone="danger" className="flex flex-col gap-3">
          <p role="alert" className="text-base font-semibold text-danger-700">
            {t("errors.generic")}
          </p>
          <Button variant="secondary" fullWidth onClick={() => void rider.refetch()}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : (
        <AvailabilityCard
          availability={availability}
          isUpdating={setAvailability.isPending}
          hasError={setAvailability.isError}
          onToggle={(next) => setAvailability.mutate(next)}
        />
      )}

      <TodaySummary summary={today.data} isLoading={today.isPending} />

      {activeDelivery.isSuccess && activeDelivery.data === null ? (
        <NoActiveDeliveryCard online={availability === "online"} />
      ) : null}
    </div>
  );
}
