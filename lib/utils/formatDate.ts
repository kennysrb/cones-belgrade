import type { Locale } from "@/i18n/routing";

const LOCALE_MAP: Record<Locale, string> = { sr: "sr-Latn-RS", en: "en-GB" };

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}
