import type { Locale } from "@/i18n/routing";

export type LocalizedString = Partial<Record<Locale, string>>;
export type LocalizedText = Partial<Record<Locale, string>>;

export function pickLocale<T extends LocalizedString | LocalizedText>(
  value: T | undefined,
  locale: Locale,
  fallback: Locale = "sr"
): string {
  if (!value) return "";
  return value[locale] ?? value[fallback] ?? "";
}
