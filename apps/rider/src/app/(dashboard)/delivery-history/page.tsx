// apps/rider/src/app/(dashboard)/delivery-history/page.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";
import { HistoryList } from "@/components/pages/delivery-history/HistoryList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDeliveryHistory } from "@/hooks/useHistory";
import type { TranslationKey } from "@/lib/i18n";
import { useTranslation } from "@/providers/LanguageProvider";
import type { HistoryFilter } from "@/types/delivery";

const FILTERS: { value: HistoryFilter; labelKey: TranslationKey }[] = [
  { value: "all", labelKey: "history.filterAll" },
  { value: "today", labelKey: "history.filterToday" },
  { value: "week", labelKey: "history.filterWeek" },
  { value: "month", labelKey: "history.filterMonth" },
];

/**
 * History: every past delivery, with a period filter.
 * The list has key={filter}, so each period starts again with the short list.
 */
export default function DeliveryHistoryPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<HistoryFilter>("week");
  const history = useDeliveryHistory(filter);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-navy">{t("history.title")}</h1>

      <div role="group" aria-label={t("history.title")} className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = item.value === filter;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(item.value)}
              className={clsx(
                "min-h-touch rounded-full border-2 px-4 text-base font-bold transition-colors",
                active
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy"
              )}
            >
              {t(item.labelKey)}
            </button>
          );
        })}
      </div>

      {history.isError && history.data === undefined ? (
        <Card tone="danger" className="flex flex-col gap-3">
          <p role="alert" className="text-base font-semibold text-danger-700">
            {t("errors.generic")}
          </p>
          <Button variant="secondary" fullWidth onClick={() => void history.refetch()}>
            {t("common.retry")}
          </Button>
        </Card>
      ) : (
        <HistoryList key={filter} entries={history.data} />
      )}
    </div>
  );
      }
