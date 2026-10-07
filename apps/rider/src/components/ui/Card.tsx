// apps/rider/src/components/ui/Card.tsx
import type { HTMLAttributes } from "react";
import clsx from "clsx";

export type CardTone = "default" | "brand" | "ok" | "danger" | "muted";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  /** Set to false when the card content needs to touch the edges. */
  padded?: boolean;
}

const TONE_CLASSES: Record<CardTone, string> = {
  default: "border-line bg-white shadow-card",
  brand: "border-brand-200 bg-brand-50",
  ok: "border-ok/30 bg-ok-50",
  danger: "border-danger/30 bg-danger-50",
  muted: "border-line bg-cream",
};

export function Card({
  tone = "default",
  padded = true,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-card border",
        TONE_CLASSES[tone],
        padded && "p-4",
        className
      )}
      {...rest}
    />
  );
}

/** Small caption above a block of content, e.g. "TODAY", "PICKUP". */
export function CardLabel({
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx("text-xs font-bold uppercase text-muted", className)}
      {...rest}
    />
  );
                          }
