import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sr", "en"] as const,
  defaultLocale: "sr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
