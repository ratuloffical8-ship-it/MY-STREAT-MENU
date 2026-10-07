// apps/rider/src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = the ONE main action on a screen (orange). */
  variant?: ButtonVariant;
  /** md = 48px tall, lg = 56px tall (use lg for the main action). */
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner and blocks taps while an action is being saved. */
  loading?: boolean;
  leftIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-cta hover:bg-brand-700 active:bg-brand-700",
  secondary:
    "border-2 border-navy bg-white text-navy hover:bg-navy-100 active:bg-navy-100",
  danger:
    "bg-danger text-white shadow-sos hover:bg-danger-700 active:bg-danger-700",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50 active:bg-brand-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-touch px-4 text-base",
  lg: "min-h-touch-lg px-5 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leftIcon,
    className,
    disabled,
    type = "button",
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        "inline-flex select-none items-center justify-center gap-2 rounded-btn font-bold transition",
        "active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:active:scale-100",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      <span>{children}</span>
    </button>
  );
});
