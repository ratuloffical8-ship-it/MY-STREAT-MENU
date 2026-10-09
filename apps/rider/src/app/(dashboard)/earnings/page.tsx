// apps/rider/src/app/(dashboard)/earnings/page.tsx
"use client";

import { EarningsOverview } from "@/components/pages/earnings/EarningsOverview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEarningsSummary } from "@/hooks/useEarnings";
import { useTranslation } from "@/providers/LanguageProvider";

/** Earnings: how much the rider made today and this week. */
export default function EarningsPage() {
  const { t } = useTranslation();
  const summary = useEarningsSummary();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-navy">{t("earnings.title")}</h1>

      {summary.isError && summary.data === undefined ? (
        <Card tone="danger" className="flex flex-col gap-3">
          <p role="alert" className="text-base font-semibold text-danger-700">
            {t("errors.generic")}
          </p>
          <Button variant="secondary" fullWidth onClick={() => void summary.refetch()}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : (
        <EarningsOverview summary={summary.data} />
      )}
    </div>
  );
}
