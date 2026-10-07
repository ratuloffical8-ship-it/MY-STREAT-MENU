// apps/rider/src/components/pages/overview/TodaySummary.tsx
"use client";

import { Card, CardLabel } from "@/components/ui/Card";
import { formatMoney, formatNumber } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";
import type { DaySummary } from "@/types/earnings";

export interface TodaySummaryProps {
  /** undefined while loading or if loading failed. */
  summary: DaySummary | undefined;
  isLoading: boolean;
}

function Value({ text, isLoading }: { text: string | null; isLoading: boolean }) {
  if (text !== null) {
    return <p className="text-2xl font-bold text-navy">{text}</p>;
  }
  if (isLoading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-navy-100" />;
  }
  // Could not load: show a dash instead of a wrong number
  return <p className="text-2xl font-bold text-muted">—</p>;
}

/** Small "today" box: deliveries finished and money earned. */
export function TodaySummary({ summary, isLoading }: TodaySummaryProps) {
  const { t, language } = useTranslation();

  const deliveriesText = summary
    ? t("home.deliveriesCount", {
        count: formatNumber(summary.deliveriesCompleted, language),
      })
    : null;
  const earningsText = summary ? formatMoney(summary.total, language) : null;

  return (
    <section className="flex flex-col gap-2" aria-label={t("home.todayTitle")}>
      <CardLabel>{t("home.todayTitle")}</CardLabel>
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-muted">{t("home.completed")}</p>
          <Value text={deliveriesText} isLoading={isLoading} />
        </Card>
        <Card className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-muted">{t("home.todayEarnings")}</p>
          <Value text={earningsText} isLoading={isLoading} />
        </Card>
      </div>
    </section>
  );
}
