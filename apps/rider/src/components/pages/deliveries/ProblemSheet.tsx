// apps/rider/src/components/pages/deliveries/ProblemSheet.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useReportProblem } from "@/hooks/useDelivery";
import { useTranslation } from "@/providers/LanguageProvider";
import {
  DROPOFF_PROBLEM_REASONS,
  PICKUP_PROBLEM_REASONS,
  type ProblemReason,
  type ProblemStage,
} from "@/types/delivery";

export interface ProblemSheetProps {
  open: boolean;
  onClose: () => void;
  deliveryId: string;
  /** Decides which reasons are listed. */
  stage: ProblemStage;
}

/** "Report a problem": tap one reason, tap send. No typing. */
export function ProblemSheet({ open, onClose, deliveryId, stage }: ProblemSheetProps) {
  const { t } = useTranslation();
  const report = useReportProblem();
  const [reason, setReason] = useState<ProblemReason | null>(null);

  const reasons: readonly ProblemReason[] =
    stage === "pickup" ? PICKUP_PROBLEM_REASONS : DROPOFF_PROBLEM_REASONS;

  function handleClose() {
    setReason(null);
    report.reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("problem.title")}
      closeLabel={t("common.close")}
    >
      {report.isSuccess ? (
        <div className="flex flex-col gap-4">
          <p role="status" className="text-base font-semibold text-ok-700">
            {t("problem.sent")}
          </p>
          <Button size="lg" fullWidth onClick={handleClose}>
            {t("common.done")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-base text-muted">{t("problem.chooseReason")}</p>

          <div role="radiogroup" aria-label={t("problem.title")} className="flex flex-col gap-2">
            {reasons.map((item) => {
              const selected = reason === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setReason(item)}
                  className={clsx(
                    "min-h-touch-lg w-full rounded-btn border-2 px-4 text-left text-base font-semibold text-navy transition-colors",
                    selected ? "border-brand-600 bg-brand-50" : "border-line bg-white"
                  )}
                >
                  {t(`problem.${item}`)}
                </button>
              );
            })}
          </div>

          {report.isError ? (
            <p role="alert" className="text-base font-semibold text-danger-700">
              {t("common.notSavedRetry")}
            </p>
          ) : null}

          <Button
            size="lg"
            fullWidth
            disabled={reason === null}
            loading={report.isPending}
            onClick={() => {
              if (reason !== null) report.mutate({ deliveryId, stage, reason });
            }}
          >
            {t("problem.submit")}
          </Button>
        </div>
      )}
    </Modal>
  );
  }
