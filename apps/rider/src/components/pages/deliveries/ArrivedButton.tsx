// apps/rider/src/components/pages/deliveries/ArrivedButton.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/providers/LanguageProvider";

export interface ArrivedButtonProps {
  /** true once the server has recorded the arrival. */
  arrived: boolean;
  isPending: boolean;
  hasError: boolean;
  onPress: () => void;
  /** Text shown after it worked, e.g. "Restaurant has been notified." */
  sentMessage: string;
}

/** "I've arrived": one tap tells the restaurant / customer. */
export function ArrivedButton({
  arrived,
  isPending,
  hasError,
  onPress,
  sentMessage,
}: ArrivedButtonProps) {
  const { t } = useTranslation();

  if (arrived) {
    return (
      <Card tone="ok">
        <p role="status" className="text-base font-bold text-ok-700">
          ✓ {sentMessage}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hasError ? (
        <p role="alert" className="text-base font-semibold text-danger-700">
          {t("common.notSavedRetry")}
        </p>
      ) : null}
      <Button variant="secondary" fullWidth loading={isPending} onClick={onPress}>
        {t("arrived.button")}
      </Button>
    </div>
  );
}
