import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { allNewsSlugsQuery, allGallerySlugsQuery } from "@/lib/sanity/queries";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";

const STATIC_PATHS = ["/", "/news", "/events", "/gallery"] as const;

function localizedUrl(path: string, locale: string) {
  if (locale === routing.defaultLocale) return `${SITE_URL}${path === "/" ? "" : path}`;
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

function alternatesFor(path: string): Record<string, string> {
  return Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(path, l)]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [newsSlugs, gallerySlugs] = await Promise.all([
    sanityFetch<string[]>({ query: allNewsSlugsQuery, tags: ["news"] }).catch(() => [] as string[]),
    sanityFetch<string[]>({ query: allGallerySlugsQuery, tags: ["galleryAlbum"] }).catch(() => [] as string[]),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: localizedUrl(path, locale),
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "/" ? 1 : 0.7,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  for (const locale of routing.locales) {
    for (const slug of newsSlugs) {
      const path = `/news/${slug}`;
      entries.push({
        url: localizedUrl(path, locale),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  for (const locale of routing.locales) {
    for (const slug of gallerySlugs) {
      const path = `/gallery/${slug}`;
      entries.push({
        url: localizedUrl(path, locale),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  return entries;
}
