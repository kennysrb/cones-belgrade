export const routing = {
  locales: ["sr", "en"] as const,
  defaultLocale: "sr" as const,
  localePrefix: "as-needed" as const,
};
export type Locale = (typeof routing.locales)[number];
