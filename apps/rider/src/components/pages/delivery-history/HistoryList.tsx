// apps/rider/src/components/pages/delivery-history/HistoryList.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, formatMoney, formatTime } from "@/lib/formatters";
import { useTranslation } from "@/providers/LanguageProvider";
import type { DeliveryHistoryEntry } from "@/types/delivery";

export interface HistoryListProps {
  /** undefined while loading. */
  entries: DeliveryHistoryEntry[] | undefined;
}

/** How many rows to show before "View all". */
const FIRST_PAGE = 20;

function SkeletonRows() {
  return (
    <Card className="flex flex-col gap-4" aria-busy="true">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-40 animate-pulse rounded bg-navy-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-navy-100" />
          </div>
          <div className="h-6 w-14 animate-pulse rounded bg-navy-100" />
        </div>
      ))}
    </Card>
  );
}

/** Past deliveries grouped by day, newest first. */
export function HistoryList({ entries }: HistoryListProps) {
  const { t, language } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  if (!entries) return <SkeletonRows />;

  if (entries.length === 0) {
    return (
      <Card tone="muted">
        <p className="text-base font-semibold text-muted">{t("history.empty")}</p>
      </Card>
    );
  }

  const visible = showAll ? entries : entries.slice(0, FIRST_PAGE);

  // Group neighbouring rows that share the same day
  const groups: { day: string; rows: DeliveryHistoryEntry[] }[] = [];
  for (const entry of visible) {
    const day = formatDate(entry.finishedAt, language);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.rows.push(entry);
    else groups.push({ day, rows: [entry] });
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.day} className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted">{group.day}</h2>
          <Card padded={false}>
            <ul className="flex flex-col divide-y divide-line">
              {group.rows.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-bold text-navy">
                      {entry.restaurantName}
                    </span>
                    <span className="text-sm text-muted">
                      #{entry.orderCode} · {entry.area} · {formatTime(entry.finishedAt, language)}
                    </span>
                  </div>
                  {entry.status === "cancelled" ? (
                    <Badge tone="danger">{t("history.cancelled")}</Badge>
                  ) : (
                    <span className="shrink-0 text-lg font-bold text-ok-700">
                      {formatMoney(entry.earning + entry.tip, language)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ))}

      {!showAll && entries.length > FIRST_PAGE ? (
        <Button variant="secondary" fullWidth onClick={() => setShowAll(true)}>
          {t("common.viewAll")}
        </Button>
      ) : null}
    </div>
  );
                }
