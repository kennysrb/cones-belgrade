import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.SITE_URL || "https://conesbelgrade.rs";

const DEFAULTS = {
  sr: {
    title: "Cones Belgrade — Hokejaški klub Beograd",
    description:
      "Cones Belgrade je amaterski hokejaški klub iz Beograda. Treninzi, turniri, utakmice i zajednica od 2014. godine.",
  },
  en: {
    title: "Cones Belgrade — Belgrade Hockey Club",
    description:
      "Cones Belgrade is an amateur ice hockey club from Belgrade, Serbia. Practices, tournaments, matches, and community since 2014.",
  },
} as const;

function alternatesForPath(path = "/"): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}${l === routing.defaultLocale ? "" : `/${l}`}${path}`])
  );
  return {
    canonical: `${SITE_URL}${path}`,
    languages: { ...languages, "x-default": `${SITE_URL}${path}` },
  };
}

export function rootMetadata(locale: Locale, path = "/"): Metadata {
  const d = DEFAULTS[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: "%s · Cones Belgrade" },
    description: d.description,
    alternates: alternatesForPath(path),
    openGraph: {
      type: "website",
      locale: locale === "sr" ? "sr_RS" : "en_US",
      siteName: "Cones Belgrade",
      title: d.title,
      description: d.description,
      url: `${SITE_URL}${locale === "sr" ? "" : `/${locale}`}${path}`,
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
    alternates: alternatesForPath(path),
    openGraph: {
      type: "article",
      locale: locale === "sr" ? "sr_RS" : "en_US",
      title,
      description,
      publishedTime: publishedAt,
      url: `${SITE_URL}${locale === "sr" ? "" : `/${locale}`}${path}`,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}
