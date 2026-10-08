// apps/rider/src/components/ui/Modal.tsx
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import clsx from "clsx";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Screen-reader text for the close (X) button, e.g. "Close". */
  closeLabel: string;
  children: ReactNode;
  /** false = rider must use the buttons inside (no X, no outside tap, no Esc). */
  dismissible?: boolean;
  /** danger = red top edge (used for the SOS confirmation). */
  tone?: "default" | "danger";
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  children,
  dismissible = true,
  tone = "default",
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Always call the latest onClose without re-running the effect below
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && dismissible) onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, dismissible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-navy/60"
        aria-hidden="true"
        onClick={dismissible ? onClose : undefined}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          "relative max-h-[90dvh] w-full max-w-md overflow-y-auto bg-white px-5 pt-5 shadow-card outline-none",
          "rounded-t-3xl sm:rounded-3xl",
          tone === "danger" && "border-t-4 border-danger"
        )}
        style={{
          paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-bold text-navy">
            {title}
          </h2>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="-mr-2 -mt-1 flex min-h-touch min-w-touch items-center justify-center rounded-full text-2xl text-muted hover:bg-navy-100"
            >
              <span aria-hidden="true">✕</span>
            </button>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
  }
