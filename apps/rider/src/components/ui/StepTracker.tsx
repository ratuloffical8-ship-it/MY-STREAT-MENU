// apps/rider/src/components/ui/StepTracker.tsx
import clsx from "clsx";
import { DELIVERY_STEPS, type DeliveryStep } from "@/types/delivery";

export interface StepTrackerProps {
  /** Which step the rider is on now. "complete" = everything is done. */
  current: DeliveryStep;
  /** Translated names, e.g. { pickup: "Pickup", dropoff: "Drop-off", complete: "Complete" } */
  labels: Record<DeliveryStep, string>;
  className?: string;
}

type StepState = "done" | "current" | "upcoming";

function getState(index: number, currentIndex: number, lastIndex: number): StepState {
  if (index < currentIndex) return "done";
  if (index === currentIndex) return index === lastIndex ? "done" : "current";
  return "upcoming";
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** High-contrast progress bar: Pickup -> Drop-off -> Complete */
export function StepTracker({ current, labels, className }: StepTrackerProps) {
  const currentIndex = DELIVERY_STEPS.indexOf(current);
  const lastIndex = DELIVERY_STEPS.length - 1;

  return (
    <ol className={clsx("flex w-full items-start", className)}>
      {DELIVERY_STEPS.map((step, index) => {
        const state = getState(index, currentIndex, lastIndex);

        return (
          <li
            key={step}
            aria-current={index === currentIndex ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1.5"
          >
            {index < lastIndex ? (
              <span
                aria-hidden="true"
                className={clsx(
                  "absolute left-1/2 top-[14px] h-1 w-full",
                  index < currentIndex ? "bg-ok" : "bg-navy-100"
                )}
              />
            ) : null}

            <span
              className={clsx(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                state === "done" && "bg-ok text-white",
                state === "current" && "bg-brand-600 text-white ring-4 ring-brand-200",
                state === "upcoming" && "bg-navy-100 text-muted"
              )}
            >
              {state === "done" ? (
                <CheckIcon />
              ) : state === "current" ? (
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              ) : null}
            </span>

            <span
              className={clsx(
                "text-xs font-bold",
                state === "upcoming" ? "text-muted" : "text-navy"
              )}
            >
              {labels[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
