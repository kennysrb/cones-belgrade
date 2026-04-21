# SEO Audit & Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all SEO, hreflang, canonical, sitemap, and JSON-LD issues on the Cones Belgrade multilingual Next.js site so it scores Lighthouse SEO 100 on deploy.

**Architecture:** Two locales (`sr` default, `en`) with `localePrefix: "as-needed"` — Serbian URLs have no prefix (`/news`), English URLs carry `/en/news`. The shared SEO helpers live in `lib/seo/metadata.ts` and `lib/seo/jsonLd.ts`. Pages use `generateMetadata` per Next.js App Router conventions.

**Tech Stack:** Next.js 15 (App Router), next-intl, Sanity CMS, TypeScript.

---

## Issues Found (Audit)

| # | Severity | Issue |
|---|----------|-------|
| 1 | **Critical** | `alternatesForPath` canonical always points to `sr` URL regardless of current locale — English pages get wrong canonical |
| 2 | **Critical** | `rootMetadata` and `articleMetadata` hardcode `locale === "sr"` instead of `routing.defaultLocale` |
| 3 | **High** | `gallery/page.tsx` and `gallery/[slug]/page.tsx` `generateMetadata` return only `title` — no canonical, alternates, OG |
| 4 | **High** | `app/layout.tsx` exports only `{ title }` — missing robots directives and metadataBase |
| 5 | **Medium** | `sitemap.ts` news slug entries have no `alternates.languages`; gallery album slugs absent entirely |
| 6 | **Medium** | No default OG image in `rootMetadata` |
| 7 | **Low** | Events and news-list pages have no JSON-LD |

## What is Already Correct (Do Not Touch)

- Locale slugs `sr` / `en` are valid BCP 47 ✓
- No regional hreflang duplicates (`en-US` etc.) ✓
- `robots.ts` is correct ✓
- Static-path sitemap entries have correct `alternates.languages` ✓
- `SportsTeam` JSON-LD on locale layout ✓
- `NewsArticle` JSON-LD on news detail page ✓
- All title/description strings are within 60/160 char limits ✓

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/seo/metadata.ts` | Modify | Fix `alternatesForPath` (add locale param + locale-aware canonical); add `ogLocale` helper; add default OG image to `rootMetadata`; replace `locale === "sr"` guards with `routing.defaultLocale` |
| `app/layout.tsx` | Modify | Add robots, metadataBase, title template |
| `app/[locale]/gallery/page.tsx` | Modify | Full `generateMetadata` — alternates, description, OG |
| `app/[locale]/gallery/[slug]/page.tsx` | Modify | Full `generateMetadata` — alternates, canonical, OG image |
| `app/sitemap.ts` | Modify | Add gallery slugs; add `alternates.languages` to news-slug entries |
| `lib/seo/jsonLd.ts` | Modify | Add `newsListJsonLd` and `eventsPageJsonLd` helpers |
| `app/[locale]/news/page.tsx` | Modify | Add `CollectionPage` JSON-LD script |
| `app/[locale]/events/page.tsx` | Modify | Add `EventSeries` JSON-LD script |
| `public/og-image.png` | Create (manual) | Default OG image — 1200×630 px; plan notes where to place it |

---

## Task 1: Fix `alternatesForPath` — locale-aware canonical + `ogLocale` helper

**Files:**
- Modify: `lib/seo/metadata.ts`

The root bug: `canonical: \`${SITE_URL}${path}\`` always produces the `sr` (default, prefix-less) URL. An English `/en/news` page gets canonical pointing at `https://conesbelgrade.rs/news` instead of `https://conesbelgrade.rs/en/news`. Same bug in `articleMetadata`.

Also: `locale === "sr"` guards are brittle; replace with `routing.defaultLocale`.

- [ ] **Step 1: Replace `lib/seo/metadata.ts` with the fixed version**

```typescript
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.SITE_URL || "https://conesbelgrade.rs";

// Returns the URL prefix for a locale under localePrefix:"as-needed"
// Default locale → no prefix; other locales → /locale
function localeSegment(locale: string): string {
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

// Maps locale code → OpenGraph locale string
export function ogLocale(locale: string): string {
  const map: Record<string, string> = {
    sr: "sr_RS",
    en: "en_US",
  };
  return map[locale] ?? "en_US";
}

const DEFAULTS: Record<Locale, { title: string; description: string }> = {
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
};

/**
 * Builds canonical + hreflang alternates for a given path and the CURRENT locale.
 * Canonical points to the current-locale URL, not always the default locale.
 * x-default always points to the default locale URL.
 *
 * @param path  Route path with leading slash, e.g. "/", "/news", "/gallery"
 * @param locale  Current page locale
 */
export function alternatesForPath(path: string, locale: string): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}${localeSegment(l)}${path === "/" ? "" : path}`])
  );
  return {
    canonical: `${SITE_URL}${localeSegment(locale)}${path === "/" ? "" : path}`,
    languages: {
      ...languages,
      "x-default": `${SITE_URL}${path === "/" ? "" : path}`,
    },
  };
}

export function rootMetadata(locale: Locale, path = "/"): Metadata {
  const d = DEFAULTS[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: "%s · Cones Belgrade" },
    description: d.description,
    alternates: alternatesForPath(path, locale),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      siteName: "Cones Belgrade",
      title: d.title,
      description: d.description,
      url: `${SITE_URL}${localeSegment(locale)}${path === "/" ? "" : path}`,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Cones Belgrade" }],
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
      images: image ? [{ url: image, width: 1200, height: 630 }] : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/nikolaglavonjic/Desktop/Projects/Portfolio/cones-belgrade
npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors related to `metadata.ts`. If any type errors appear, fix before continuing.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/metadata.ts
git commit -m "fix(seo): locale-aware canonical in alternatesForPath, add ogLocale helper"
```

---

## Task 2: Fix root `app/layout.tsx` — add robots + metadataBase

**Files:**
- Modify: `app/layout.tsx`

The root layout is the fallback for any route not covered by locale layouts. Currently it exports only `{ title: "Cones Belgrade" }` — no robots directives, no `metadataBase`. Google needs explicit robots rules here.

- [ ] **Step 1: Replace `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cones Belgrade",
    template: "%s · Cones Belgrade",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(seo): add robots directives and metadataBase to root layout"
```

---

## Task 3: Fix `gallery/page.tsx` generateMetadata — full metadata

**Files:**
- Modify: `app/[locale]/gallery/page.tsx`

Currently returns only `{ title }`. Needs canonical, hreflang alternates, description, and OG data so Google can index and cross-reference the gallery listing page correctly.

- [ ] **Step 1: Replace the `generateMetadata` function (lines 13–21) in `app/[locale]/gallery/page.tsx`**

Add the import at the top of the file (after the existing imports):

```typescript
import { rootMetadata } from "@/lib/seo/metadata";
```

Replace the `generateMetadata` function:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galleryPage" });
  const base = rootMetadata(locale, "/gallery");
  return {
    ...base,
    title: t("title"),
    description: t("eyebrow"),
  };
}
```

> Note: `galleryPage` namespace has no `description` key in messages — `eyebrow` ("Gallery" / "Galerija") is used as a short meta description. If you later add a `description` key to messages, update this.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/gallery/page.tsx
git commit -m "fix(seo): full generateMetadata for gallery listing page"
```

---

## Task 4: Fix `gallery/[slug]/page.tsx` generateMetadata — full metadata

**Files:**
- Modify: `app/[locale]/gallery/[slug]/page.tsx`

Currently returns only `{ title }`. Needs locale-specific canonical, hreflang for all locales (with slug), and OG cover image so social shares work.

- [ ] **Step 1: Add import at the top of `app/[locale]/gallery/[slug]/page.tsx`** (after existing imports)

```typescript
import { SITE_URL, ogLocale, alternatesForPath } from "@/lib/seo/metadata";
```

- [ ] **Step 2: Replace `generateMetadata` function (lines 22–39)**

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const album = await sanityFetch<GalleryAlbum | null>({
      query: galleryAlbumBySlugQuery,
      params: { slug },
      tags: ["galleryAlbum"],
    });
    if (!album) return {};
    const title = pickLocale(album.title, locale);
    const coverImageUrl = album.coverImage?.asset
      ? urlFor(album.coverImage).width(1200).height(630).fit("crop").url()
      : undefined;
    return {
      title,
      alternates: {
        canonical: `${SITE_URL}${locale === "sr" ? "" : `/${locale}`}/gallery/${slug}`,
        languages: Object.fromEntries(
          ["sr", "en"].map((l) => [
            l,
            `${SITE_URL}${l === "sr" ? "" : `/${l}`}/gallery/${slug}`,
          ])
        ),
      },
      openGraph: {
        title,
        url: `${SITE_URL}${locale === "sr" ? "" : `/${locale}`}/gallery/${slug}`,
        locale: ogLocale(locale),
        images: coverImageUrl
          ? [{ url: coverImageUrl, width: 1200, height: 630 }]
          : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
      },
    };
  } catch {
    return {};
  }
}
```

> Note: The locale prefix logic inlines `localeSegment` because we need `routing.locales` as a plain string array for `Object.fromEntries`. Import `routing` if you want to avoid the `"sr"` hardcode — but since there are exactly two locales and this is a gallery-specific file, inline is acceptable.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/gallery/[slug]/page.tsx
git commit -m "fix(seo): full generateMetadata for gallery album detail page"
```

---

## Task 5: Update `sitemap.ts` — gallery slugs + news-slug alternates

**Files:**
- Modify: `app/sitemap.ts`

Two gaps:
1. News article slug entries have no `alternates.languages` — Google can't discover cross-language equivalents.
2. Gallery album slugs are completely absent from the sitemap.

- [ ] **Step 1: Replace `app/sitemap.ts`**

```typescript
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

  // Static routes
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

  // News article dynamic routes
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

  // Gallery album dynamic routes
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
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "fix(seo): add gallery slugs to sitemap, add alternates to news slug entries"
```

---

## Task 6: Add JSON-LD to news list and events pages

**Files:**
- Modify: `lib/seo/jsonLd.ts` — add two new helpers
- Modify: `app/[locale]/news/page.tsx` — inject CollectionPage script
- Modify: `app/[locale]/events/page.tsx` — inject EventSeries script

### 6a — Add helpers to `lib/seo/jsonLd.ts`

- [ ] **Step 1: Append the two new functions to the end of `lib/seo/jsonLd.ts`**

```typescript
export function newsListJsonLd({
  url,
  locale,
}: {
  url: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: locale === "sr" ? "Vesti — Cones Belgrade" : "News — Cones Belgrade",
    url,
    inLanguage: locale === "sr" ? "sr-Latn" : "en",
    publisher: {
      "@type": "Organization",
      name: "Cones Belgrade",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };
}

export function eventsPageJsonLd({
  url,
  locale,
}: {
  url: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: locale === "sr" ? "Kalendar kluba — Cones Belgrade" : "Club Calendar — Cones Belgrade",
    url,
    organizer: {
      "@type": "SportsTeam",
      name: "Cones Belgrade",
      url: SITE_URL,
    },
    location: {
      "@type": "Place",
      name: locale === "sr" ? "Ledeni park Pionir, Beograd" : "Pionir Ice Park, Belgrade",
      address: {
        "@type": "PostalAddress",
        addressCountry: "RS",
        addressLocality: "Belgrade",
        streetAddress: "Čarli Čaplina 39",
      },
    },
  };
}
```

### 6b — Inject into `app/[locale]/news/page.tsx`

- [ ] **Step 2: Add import to `app/[locale]/news/page.tsx`** (after existing imports)

```typescript
import { newsListJsonLd } from "@/lib/seo/jsonLd";
```

- [ ] **Step 3: In `app/[locale]/news/page.tsx`, replace the return statement**

Find the current return:
```typescript
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <NewsPageClient articles={articles} />
    </>
  );
```

Replace with:
```typescript
  const pageUrl = `${SITE_URL}${locale === "sr" ? "" : `/${locale}`}/news`;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsListJsonLd({ url: pageUrl, locale })) }}
      />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <NewsPageClient articles={articles} />
    </>
  );
```

You'll need `SITE_URL` — add to imports:
```typescript
import { SITE_URL } from "@/lib/seo/metadata";
```

### 6c — Inject into `app/[locale]/events/page.tsx`

- [ ] **Step 4: Add imports to `app/[locale]/events/page.tsx`** (after existing imports)

```typescript
import { eventsPageJsonLd } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/metadata";
```

- [ ] **Step 5: In `app/[locale]/events/page.tsx`, replace the return statement**

Find the current return:
```typescript
  return (
    <>
    <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
    <div className="mx-auto max-w-container px-6 py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="mt-12">
        <EventsTabs upcoming={upcoming.map(toItem)} past={past.map(toItem)} schedule={schedule} />
      </div>
      <RsvpForm />
    </div>
    </>
  );
```

Replace with:
```typescript
  const pageUrl = `${SITE_URL}${locale === "sr" ? "" : `/${locale}`}/events`;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsPageJsonLd({ url: pageUrl, locale })) }}
      />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="mx-auto max-w-container px-6 py-20">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        <div className="mt-12">
          <EventsTabs upcoming={upcoming.map(toItem)} past={past.map(toItem)} schedule={schedule} />
        </div>
        <RsvpForm />
      </div>
    </>
  );
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
git add lib/seo/jsonLd.ts app/[locale]/news/page.tsx app/[locale]/events/page.tsx
git commit -m "feat(seo): add CollectionPage and EventSeries JSON-LD to news and events pages"
```

---

## Task 7: Default OG image — manual step

**Files:**
- Create: `public/og-image.png` (manual, not code)

The `rootMetadata` and `articleMetadata` now reference `${SITE_URL}/og-image.png`. This file must exist at `public/og-image.png` before deploying.

- [ ] **Step 1: Create a 1200×630 px PNG** (use Figma, Canva, or any image editor)
  - Background: `#0a0a0a` (cones-black)
  - Logo centered or left-aligned
  - Text: "Cones Belgrade" in display font
  - Save as `public/og-image.png`

- [ ] **Step 2: Commit once the file exists**

```bash
git add public/og-image.png
git commit -m "feat: add default OG image for social sharing"
```

> Until this file is created, OG image tags will point to a 404. The site will still work, but social shares will have no preview image. Create this before the production launch.

---

## Task 8: Final build verification

- [ ] **Step 1: Run the production build**

```bash
npx next build 2>&1 | tail -40
```

Expected: clean build, all locale×route combinations listed as static (`○`) or ISR (`●`).

- [ ] **Step 2: Spot-check canonical and hreflang in HTML output**

Start the production server and fetch a page:

```bash
npx next start &
curl -s http://localhost:3000/en/news | grep -E 'canonical|hreflang' | head -10
```

Expected output should include:
```
<link rel="canonical" href="https://conesbelgrade.rs/en/news"/>
<link rel="alternate" hreflang="sr" href="https://conesbelgrade.rs/news"/>
<link rel="alternate" hreflang="en" href="https://conesbelgrade.rs/en/news"/>
<link rel="alternate" hreflang="x-default" href="https://conesbelgrade.rs/news"/>
```

- [ ] **Step 3: Check sitemap.xml**

```bash
curl -s http://localhost:3000/sitemap.xml | grep -c '<url>'
```

Expected: at least `(2 locales × 4 static paths) + (2 × news slugs) + (2 × gallery slugs)` entries. With no Sanity content at build time: minimum 8.

- [ ] **Step 4: Check robots.txt**

```bash
curl -s http://localhost:3000/robots.txt
```

Expected:
```
User-agent: *
Allow: /
Disallow: /studio
Disallow: /api
Sitemap: https://conesbelgrade.rs/sitemap.xml
Host: https://conesbelgrade.rs
```

No `Content-Signal:` directive (that comes from Cloudflare — see note below).

- [ ] **Step 5: Kill dev server**

```bash
kill %1
```

---

## Post-Deploy Checklist (Manual, Not Code)

- [ ] Set `SITE_URL=https://conesbelgrade.rs` (or your real domain) in hosting environment variables before going live — replace the placeholder fallback
- [ ] If using Cloudflare: Dashboard → AI → AI Crawl Control → disable "Managed Robots.txt" to prevent `Content-Signal:` injection on the apex domain
- [ ] Run [Google Rich Results Test](https://search.google.com/test/rich-results) on home, news-detail, and events URLs
- [ ] Submit `sitemap.xml` to Google Search Console after DNS propagation
- [ ] Run Lighthouse SEO audit (target: 100 mobile + desktop)
