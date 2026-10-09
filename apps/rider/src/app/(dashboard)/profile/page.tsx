// apps/rider/src/app/(dashboard)/profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LanguageSwitch } from "@/components/common/LanguageSwitch";
import { RankBadge } from "@/components/common/RankBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { ROUTES, SUPPORT_PHONE } from "@/config/constants";
import { useRider } from "@/hooks/useRider";
import { toTelUrl } from "@/lib/formatters";
import type { TranslationKey } from "@/lib/i18n";
import { useTranslation } from "@/providers/LanguageProvider";
import { signOut } from "@/services/auth";
import type { VehicleType } from "@/types/rider";

const VEHICLE_LABEL_KEYS: Record<VehicleType, TranslationKey> = {
  motorcycle: "profile.motorcycle",
  scooter: "profile.scooter",
  bicycle: "profile.bicycle",
};

function Skeleton() {
  return (
    <Card className="flex flex-col gap-3" aria-busy="true">
      <div className="h-7 w-40 animate-pulse rounded bg-navy-100" />
      <div className="h-5 w-28 animate-pulse rounded bg-navy-100" />
    </Card>
  );
}

/** Profile: who the rider is, vehicle, payout account, language, hotline, log out. */
export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const rider = useRider();

  function handleLogout() {
    signOut();
    queryClient.clear(); // the next login must not see this rider's data
    router.replace(ROUTES.login);
  }

  const data = rider.data;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-navy">{t("profile.title")}</h1>

      {data ? (
        <>
          <Card className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-navy">{data.name}</p>
              <p className="text-base text-muted">{data.phone}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RankBadge rank={data.rank} />
              <span className="text-base font-bold text-navy">★ {data.rating.toFixed(1)}</span>
            </div>
          </Card>

          <Card className="flex flex-col gap-2">
            <CardLabel>{t("profile.vehicle")}</CardLabel>
            <p className="text-lg font-bold text-navy">{t(VEHICLE_LABEL_KEYS[data.vehicle.type])}</p>
            <p className="text-base text-muted">
              {t("profile.plate")}: {data.vehicle.plateNumber}
            </p>
          </Card>

          <Card className="flex flex-col gap-2">
            <CardLabel>{t("profile.payoutAccount")}</CardLabel>
            {data.payoutAccount ? (
              <p className="text-lg font-bold text-navy">
                {data.payoutAccount.provider === "bkash" ? t("cashout.bkash") : t("cashout.nagad")}{" "}
                · {data.payoutAccount.maskedNumber}
              </p>
            ) : (
              <p className="text-base text-muted">{t("profile.notLinked")}</p>
            )}
          </Card>
        </>
      ) : rider.isError ? (
        <Card tone="danger" className="flex flex-col gap-3">
          <p role="alert" className="text-base font-semibold text-danger-700">
            {t("errors.generic")}
          </p>
          <Button variant="secondary" fullWidth onClick={() => void rider.refetch()}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : (
        <Skeleton />
      )}

      <Card className="flex flex-col gap-3">
        <CardLabel>{t("profile.language")}</CardLabel>
        <LanguageSwitch className="self-start" />
      </Card>

      {SUPPORT_PHONE ? (
        <Card className="flex flex-col gap-3">
          <CardLabel>{t("support.hotline")}</CardLabel>
          <p className="text-lg font-bold text-navy">{SUPPORT_PHONE}</p>
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<span aria-hidden="true">📞</span>}
            onClick={() => window.location.assign(toTelUrl(SUPPORT_PHONE))}
          >
            {t("support.callHotline")}
          </Button>
        </Card>
      ) : null}

      <Button variant="secondary" fullWidth onClick={handleLogout}>
        {t("profile.logout")}
      </Button>
    </div>
  );
        }
