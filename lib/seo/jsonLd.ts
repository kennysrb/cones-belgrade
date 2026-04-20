import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "./metadata";

export function sportsTeamJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: "Cones Belgrade",
    sport: "Ice hockey",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    foundingDate: "2014",
    location: {
      "@type": "Place",
      name:
        locale === "sr"
          ? "Ledeni park Pionir, Beograd"
          : "Pionir Ice Park, Belgrade",
      address: {
        "@type": "PostalAddress",
        addressCountry: "RS",
        addressLocality: "Belgrade",
        streetAddress: "Čarli Čaplina 39",
      },
    },
    sameAs: [
      "https://instagram.com/cones_belgrade011/",
      "https://facebook.com/icehockeybelgrade",
    ],
  };
}

export function newsArticleJsonLd({
  url,
  headline,
  description,
  image,
  datePublished,
  locale,
}: {
  url: string;
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    image: image ? [image] : undefined,
    datePublished,
    inLanguage: locale === "sr" ? "sr-Latn" : "en",
    mainEntityOfPage: url,
    publisher: {
      "@type": "Organization",
      name: "Cones Belgrade",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };
}

export function sportsEventJsonLd({
  name,
  startDate,
  endDate,
  locationName,
  url,
}: {
  name: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name,
    startDate,
    endDate,
    location: locationName
      ? { "@type": "Place", name: locationName }
      : undefined,
    url,
  };
}
