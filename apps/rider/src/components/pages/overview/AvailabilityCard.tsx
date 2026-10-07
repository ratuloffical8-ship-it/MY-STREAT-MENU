// apps/rider/src/components/pages/overview/AvailabilityCard.tsx
"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { useTranslation } from "@/providers/LanguageProvider";
import type { AvailabilityStatus } from "@/types/rider";

export interface AvailabilityCardProps {
  /** undefined while the rider is still loading. */
  availability: AvailabilityStatus | undefined;
  /** true while the change is being saved. */
  isUpdating: boolean;
  /** true if the last change could not be saved. */
  hasError: boolean;
  onToggle: (next: AvailabilityStatus) => void;
}

/** Green card = Online, gray card = Offline, one big button to switch. */
export function AvailabilityCard({
  availability,
  isUpdating,
  hasError,
  onToggle,
}: AvailabilityCardProps) {
  const { t } = useTranslation();

  if (availability === undefined) {
    return (
      <Card className="flex flex-col gap-3" aria-busy="true">
        <div className="h-4 w-28 animate-pulse rounded bg-navy-100" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-navy-100" />
        <div className="h-14 w-full animate-pulse rounded-btn bg-navy-100" />
      </Card>
    );
  }

  const online = availability === "online";

  return (
    <Card tone={online ? "ok" : "muted"} className="flex flex-col gap-3">
      <CardLabel>{t("home.availability")}</CardLabel>

      <div aria-live="polite" className="flex flex-col gap-2">
        <Badge tone={online ? "ok" : "muted"} dot className="self-start text-base">
          {online ? t("home.online") : t("home.offline")}
        </Badge>
        <p className="text-base text-muted">
          {online ? t("home.onlineHint") : t("home.offlineHint")}
        </p>
      </div>

      {hasError ? (
        <p role="alert" className="text-base font-semibold text-danger-700">
          {t("common.notSavedRetry")}
        </p>
      ) : null}

      <Button
        size="lg"
        fullWidth
        variant={online ? "secondary" : "primary"}
        loading={isUpdating}
        onClick={() => onToggle(online ? "offline" : "online")}
      >
        {online ? t("home.goOffline") : t("home.goOnline")}
      </Button>
    </Card>
  );
        }
