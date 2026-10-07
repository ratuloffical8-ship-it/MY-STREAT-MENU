// apps/rider/src/app/(auth)/login/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LOGIN_OTP_LENGTH, ROUTES, USE_MOCK_DATA } from "@/config/constants";
import { formatCountdown } from "@/lib/formatters";
import { digitsOnly } from "@/lib/phone";
import { useLanguage } from "@/providers/LanguageProvider";
import { otpSchema, phoneSchema } from "@/schemas/auth";
import { ApiError } from "@/services/api";
import { requestOtp, signIn } from "@/services/auth";
import { MOCK_LOGIN_OTP } from "@/services/mock-data";

type Step = "phone" | "otp";

interface LoginError {
  code: "invalidPhone" | "invalidOtp" | "network" | "generic" | "server";
  /** Message from the backend (only used when code is "server"). */
  message?: string;
}

const INPUT_CLASSES =
  "min-h-touch-lg w-full rounded-btn border-2 bg-white px-4 text-lg font-semibold text-navy " +
  "placeholder:font-normal placeholder:text-muted/60 focus:border-brand-600 focus:outline-none";

/** Only allow returning to a page inside this app (blocks "//evil.com"). */
function getSafeNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  const isInternal =
    next !== null &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\") &&
    !next.startsWith(ROUTES.login);
  return isInternal ? next : ROUTES.home;
}

function toLoginError(error: unknown, step: Step): LoginError {
  if (error instanceof ApiError) {
    if (error.kind === "network" || error.kind === "timeout") {
      return { code: "network" };
    }
    if (step === "otp" && (error.kind === "client" || error.kind === "unauthorized")) {
      return { code: "invalidOtp" };
    }
    if (step === "phone" && error.kind === "client" && error.message) {
      return { code: "server", message: error.message };
    }
  }
  return { code: "generic" };
}

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState(""); // cleaned: 01XXXXXXXXX
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  // Tick every second on the OTP step so the resend countdown updates
  useEffect(() => {
    if (step !== "otp") return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);

  const resendRemainingMs = Math.max(0, resendAt - now);

  const errorText = error
    ? error.code === "server"
      ? (error.message ?? t("errors.generic"))
      : error.code === "network"
        ? t("errors.network")
        : error.code === "generic"
          ? t("errors.generic")
          : t(`auth.${error.code}`)
    : null;

  async function sendOtp(cleanPhone: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await requestOtp({ phone: cleanPhone });
      setPhone(cleanPhone);
      setOtp("");
      setResendAt(Date.now() + result.resendAfterSeconds * 1000);
      setStep("otp");
    } catch (caught) {
      setError(toLoginError(caught, "phone"));
    } finally {
      setLoading(false);
    }
  }

  function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const parsed = phoneSchema.safeParse(phoneInput);
    if (!parsed.success) {
      setError({ code: "invalidPhone" });
      return;
    }
    void sendOtp(parsed.data);
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError({ code: "invalidOtp" });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn({ phone, otp: parsed.data });
      router.replace(getSafeNextPath());
      // Stay in the loading state while the next page opens
    } catch (caught) {
      setError(toLoginError(caught, "otp"));
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("phone");
    setOtp("");
    setError(null);
  }

  return (
    <Card className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-navy">{t("auth.loginTitle")}</h1>

      {step === "phone" ? (
        <form onSubmit={handlePhoneSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-bold text-navy">
              {t("auth.phoneLabel")}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              autoFocus
              maxLength={20}
              value={phoneInput}
              onChange={(event) => {
                setPhoneInput(event.target.value);
                if (error) setError(null);
              }}
              placeholder={t("auth.phonePlaceholder")}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              className={clsx(INPUT_CLASSES, error ? "border-danger" : "border-line")}
            />
          </div>

          {errorText ? (
            <p id="login-error" role="alert" className="text-base font-semibold text-danger-700">
              {errorText}
            </p>
          ) : null}

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {t("auth.sendOtp")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="otp" className="text-sm font-bold text-navy">
              {t("auth.otpLabel", { phone })}
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              autoFocus
              maxLength={LOGIN_OTP_LENGTH}
              value={otp}
              onChange={(event) => {
                setOtp(digitsOnly(event.target.value, LOGIN_OTP_LENGTH));
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              className={clsx(
                INPUT_CLASSES,
                "text-center text-2xl tracking-[0.4em]",
                error ? "border-danger" : "border-line"
              )}
            />
          </div>

          {errorText ? (
            <p id="login-error" role="alert" className="text-base font-semibold text-danger-700">
              {errorText}
            </p>
          ) : null}

          <Button type="submit" size="lg" fullWidth loading={loading}>
            {t("auth.verify")}
          </Button>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={handleBack} disabled={loading}>
              {t("common.back")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void sendOtp(phone)}
              disabled={loading || resendRemainingMs > 0}
            >
              {resendRemainingMs > 0
                ? `${t("auth.resendOtp")} (${formatCountdown(resendRemainingMs, language)})`
                : t("auth.resendOtp")}
            </Button>
          </div>
        </form>
      )}

      {USE_MOCK_DATA ? (
        <p className="rounded-btn bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
          {t("auth.demoHint", { otp: MOCK_LOGIN_OTP })}
        </p>
      ) : null}
    </Card>
  );
        }
