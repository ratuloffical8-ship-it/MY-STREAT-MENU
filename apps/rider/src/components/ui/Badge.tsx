// apps/rider/src/components/ui/Badge.tsx
import type { HTMLAttributes } from "react";
import clsx from "clsx";

export type BadgeTone = "ok" | "muted" | "brand" | "danger" | "gold" | "navy";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Shows a small coloured dot before the text, like "● Online". */
  dot?: boolean;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  ok: "bg-ok-50 text-ok-700",
  muted: "bg-navy-100 text-navy",
  brand: "bg-brand-100 text-brand-700",
  danger: "bg-danger-50 text-danger-700",
  gold: "bg-gold-50 text-gold-700",
  navy: "bg-navy text-white",
};

export function Badge({
  tone = "muted",
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold",
        TONE_CLASSES[tone],
        className
      )}
      {...rest}
    >
      {dot ? (
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
