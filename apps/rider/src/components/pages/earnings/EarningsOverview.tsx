// apps/rider/src/components/pages/earnings/EarningsOverview.tsx
"use client";

import { Card, CardLabel } from "@/components/ui/Card";
import { formatDate, formatMoney, formatNumber } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";
import type { EarningsSummary } from "@/types/earnings";

export interface EarningsOverviewProps {
  /** undefined while loading. */
  summary: EarningsSummary | undefined;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-lg font-bold text-navy">{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="flex flex-col gap-3" aria-busy="true">
      <div className="h-4 w-24 animate-pulse rounded bg-navy-100" />
      <div className="h-10 w-40 animate-pulse rounded bg-navy-100" />
      <div className="h-12 w-full animate-pulse rounded bg-navy-100" />
    </Card>
  );
}

/** Today and this week: money, deliveries, tips, bonus, and a day-by-day list. */
export function EarningsOverview({ summary }: EarningsOverviewProps) {
  const { t, language } = useTranslation();

  if (!summary) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const { today, week } = summary;

  return (
    <div className="flex flex-col gap-4">
      <Card tone="ok" className="flex flex-col gap-3">
        <CardLabel>{t("earnings.today")}</CardLabel>
        <p className="text-4xl font-bold text-ok-700">{formatMoney(today.total, language)}</p>
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label={t("earnings.deliveries")}
            value={formatNumber(today.deliveriesCompleted, language)}
          />
          <Stat label={t("earnings.tips")} value={formatMoney(today.tips, language)} />
          <Stat label={t("earnings.bonus")} value={formatMoney(today.bonus, language)} />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <CardLabel>{t("earnings.week")}</CardLabel>
          <p className="text-sm text-muted">
            {formatDate(week.periodStart, language)} – {formatDate(week.periodEnd, language)}
          </p>
        </div>
        <p className="text-4xl font-bold text-navy">{formatMoney(week.total, language)}</p>
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label={t("earnings.deliveries")}
            value={formatNumber(week.deliveriesCompleted, language)}
          />
          <Stat label={t("earnings.tips")} value={formatMoney(week.tips, language)} />
          <Stat label={t("earnings.bonus")} value={formatMoney(week.bonus, language)} />
        </div>

        <ul className="mt-1 flex flex-col divide-y divide-line border-t border-line">
          {week.days.map((day, index) => (
            <li key={day.date} className="flex items-center justify-between gap-3 py-3">
              <div className="flex flex-col">
                <span className="text-base font-bold text-navy">
                  {index === 0 ? t("common.today") : formatDate(day.date, language)}
                </span>
                <span className="text-sm text-muted">
                  {t("home.deliveriesCount", {
                    count: formatNumber(day.deliveriesCompleted, language),
                  })}
                </span>
              </div>
              <span className="text-lg font-bold text-navy">
                {formatMoney(day.total, language)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="muted" className="flex flex-col gap-1">
        <CardLabel>{t("earnings.payoutSchedule")}</CardLabel>
        <p className="text-base text-navy">{t("earnings.payoutHint")}</p>
      </Card>
    </div>
  );
      }
