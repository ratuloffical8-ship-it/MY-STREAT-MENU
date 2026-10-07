// apps/rider/src/components/common/LanguageSwitch.tsx
"use client";

import clsx from "clsx";
import { LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "@/providers/LanguageProvider";

/** বাংলা | English switch. The choice is remembered on the device. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("profile.language")}
      className={clsx(
        "inline-flex rounded-full border border-line bg-white p-1",
        className
      )}
    >
      {LANGUAGES.map((code) => {
        const active = code === language;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            onClick={() => setLanguage(code)}
            className={clsx(
              "min-h-touch rounded-full px-4 text-sm font-bold transition-colors",
              active ? "bg-navy text-white" : "text-navy hover:bg-navy-100"
            )}
          >
            {t(`languages.${code}`)}
          </button>
        );
      })}
    </div>
  );
}
