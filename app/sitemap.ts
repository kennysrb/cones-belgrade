import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { allNewsSlugsQuery } from "@/lib/sanity/queries";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/metadata";

const STATIC_PATHS = ["/", "/news", "/events"];

function localizedUrl(path: string, locale: string) {
  if (locale === routing.defaultLocale) return `${SITE_URL}${path === "/" ? "" : path}`;
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await sanityFetch<string[]>({ query: allNewsSlugsQuery, tags: ["news"] }).catch(() => []);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: localizedUrl(path, locale),
        lastModified: now,
        changeFrequency: "weekly",
        priority: path === "/" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, localizedUrl(path, l)])
          ),
        },
      });
    }
    for (const slug of slugs) {
      entries.push({
        url: localizedUrl(`/news/${slug}`, locale),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
