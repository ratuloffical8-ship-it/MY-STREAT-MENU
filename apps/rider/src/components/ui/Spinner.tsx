// apps/rider/src/components/ui/Spinner.tsx
import clsx from "clsx";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  /** Screen-reader text. If omitted, the spinner is hidden from screen readers. */
  label?: string;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
} as const;

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <svg
      className={clsx("animate-spin", SIZE_CLASSES[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
