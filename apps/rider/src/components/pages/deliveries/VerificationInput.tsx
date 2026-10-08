// apps/rider/src/components/pages/deliveries/VerificationInput.tsx
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { DELIVERY_OTP_LENGTH } from "@/config/constants";
import { fileToResizedDataUrl } from "@/lib/image";
import { digitsOnly } from "@/lib/phone";
import { useTranslation } from "@/providers/LanguageProvider";

export interface VerificationInputProps {
  /** "otp" = customer tells a 4-digit code. "photo" = contactless doorstep photo. */
  method: "otp" | "photo";
  otp: string;
  onOtpChange: (value: string) => void;
  /** Photo as a data URL, or null if not taken yet. */
  photo: string | null;
  onPhotoChange: (value: string | null) => void;
  disabled?: boolean;
  hasError?: boolean;
}

/** The extra proof some deliveries need before "Confirm delivery". */
export function VerificationInput({
  method,
  otp,
  onOtpChange,
  photo,
  onPhotoChange,
  disabled = false,
  hasError = false,
}: VerificationInputProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the rider pick the same photo again
    if (!file) return;

    setProcessing(true);
    setPhotoFailed(false);
    try {
      onPhotoChange(await fileToResizedDataUrl(file));
    } catch {
      setPhotoFailed(true);
    } finally {
      setProcessing(false);
    }
  }

  if (method === "otp") {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor="delivery-otp" className="text-base font-bold text-navy">
          {t("dropoff.enterOtp")}
        </label>
        <input
          id="delivery-otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={DELIVERY_OTP_LENGTH}
          disabled={disabled}
          value={otp}
          onChange={(event) =>
            onOtpChange(digitsOnly(event.target.value, DELIVERY_OTP_LENGTH))
          }
          aria-invalid={hasError ? true : undefined}
          className={clsx(
            "min-h-touch-lg w-full rounded-btn border-2 bg-white px-4 text-center text-2xl font-bold tracking-[0.4em] text-navy",
            "focus:border-brand-600 focus:outline-none disabled:opacity-60",
            hasError ? "border-danger" : "border-line"
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-bold text-navy">{t("dropoff.photoRequired")}</p>

      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={t("dropoff.photoRequired")}
          className="max-h-64 w-full rounded-btn border border-line object-cover"
        />
      ) : null}

      {photoFailed ? (
        <p role="alert" className="text-base font-semibold text-danger-700">
          {t("errors.generic")}
        </p>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        data-testid="photo-input"
        onChange={(event) => void handleFile(event)}
      />
      <Button
        variant="secondary"
        fullWidth
        disabled={disabled}
        loading={processing}
        leftIcon={<span aria-hidden="true">📷</span>}
        onClick={() => fileRef.current?.click()}
      >
        {photo ? t("dropoff.retakePhoto") : t("dropoff.takePhoto")}
      </Button>
    </div>
  );
        }
