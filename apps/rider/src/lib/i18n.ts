// apps/rider/src/lib/i18n.ts
import bn from "@/lib/locales/bn.json";
import en from "@/lib/locales/en.json";
import type { Language } from "@/types/rider";

/** Shape of every language file. bn.json must have exactly the same keys as en.json. */
export type Messages = typeof en;

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends object
      ? Leaves<T[K], `${P}${K}.`>
      : never;
}[keyof T & string];

/** Every valid translation key, e.g. "home.online". ("//" is just a file comment.) */
export type TranslationKey = Exclude<Leaves<Messages>, "//">;

export type TranslationParams = Record<string, string | number>;

// If bn.json and en.json ever get out of sync, this line fails at build time.
const dictionaries: Record<Language, Messages> = { bn, en };

export const LANGUAGES: readonly Language[] = ["bn", "en"];
export const LANGUAGE_STORAGE_KEY = "msm-rider-language";
const FALLBACK_LANGUAGE: Language = "bn";

export function isLanguage(value: unknown): value is Language {
  return value === "bn" || value === "en";
}

/** Default language from NEXT_PUBLIC_DEFAULT_LANGUAGE (falls back to Bengali). */
export function getDefaultLanguage(): Language {
  const fromEnv = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;
  return isLanguage(fromEnv) ? fromEnv : FALLBACK_LANGUAGE;
}

function lookup(dictionary: unknown, key: string): string | undefined {
  let node: unknown = dictionary;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Replaces {name} placeholders. Unknown placeholders are left untouched. */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name)
      ? String(params[name])
      : match
  );
}

/** Looks up a key in the chosen language. Missing -> English -> the key itself. */
export function translate(
  lang: Language,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const text =
    lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key) ?? key;
  return interpolate(text, params);
}

export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

export function createTranslator(lang: Language): Translator {
  return (key, params) => translate(lang, key, params);
    }
