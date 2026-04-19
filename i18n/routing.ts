import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sr", "en"] as const,
  defaultLocale: "sr",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/news": { sr: "/vesti", en: "/news" },
    "/news/[slug]": { sr: "/vesti/[slug]", en: "/news/[slug]" },
    "/events": { sr: "/dogadjaji", en: "/events" },
  },
});

export type Locale = (typeof routing.locales)[number];
