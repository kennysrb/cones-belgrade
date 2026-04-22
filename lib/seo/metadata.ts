import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.SITE_URL || "https://conesbelgrade.rs";

function localeSegment(locale: string): string {
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

export function ogLocale(locale: string): string {
  const map: Record<string, string> = {
    sr: "sr_RS",
    en: "en_US",
  };
  return map[locale] ?? "en_US";
}

const DEFAULTS: Record<Locale, { title: string; description: string }> = {
  sr: {
    title: "Cones Hockey Club — Hokejaški klub Beograd",
    description:
      "Cones Hockey Club je amaterski hokejaški klub iz Beograda. Treninzi, turniri, utakmice i zajednica od 2014. godine.",
  },
  en: {
    title: "Cones Hockey Club — Belgrade Hockey Club",
    description:
      "Cones Hockey Club is an amateur ice hockey club from Belgrade, Serbia. Practices, tournaments, matches, and community since 2014.",
  },
};

/**
 * Canonical points to the current-locale URL. x-default points to default locale (prefix-less).
 */
export function alternatesForPath(path: string, locale: string): Metadata["alternates"] {
  const p = path === "/" ? "" : path;
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}${localeSegment(l)}${p}`])
  );
  return {
    canonical: `${SITE_URL}${localeSegment(locale)}${p}`,
    languages: { ...languages, "x-default": `${SITE_URL}${p}` },
  };
}

export function rootMetadata(locale: Locale, path = "/"): Metadata {
  const d = DEFAULTS[locale];
  const p = path === "/" ? "" : path;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: "%s · Cones Hockey Club" },
    description: d.description,
    alternates: alternatesForPath(path, locale),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "Cones Hockey Club",
      title: d.title,
      description: d.description,
      url: `${SITE_URL}${localeSegment(locale)}${p}`,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Cones Hockey Club" }],
    },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  };
}

export function articleMetadata({
  locale,
  slug,
  title,
  description,
  image,
  publishedAt,
}: {
  locale: Locale;
  slug: string;
  title: string;
  description?: string;
  image?: string;
  publishedAt?: string;
}): Metadata {
  const path = `/news/${slug}`;
  return {
    title,
    description,
    alternates: alternatesForPath(path, locale),
    openGraph: {
      type: "article",
      locale: ogLocale(locale),
      title,
      description,
      publishedTime: publishedAt,
      url: `${SITE_URL}${localeSegment(locale)}${path}`,
      images: image
        ? [{ url: image, width: 1200, height: 630 }]
        : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}
