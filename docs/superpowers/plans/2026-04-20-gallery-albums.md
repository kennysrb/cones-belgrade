# Gallery Albums Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `siteSettings.galleryImages` array with a structured `galleryAlbum` Sanity document type, add a `/gallery` album grid page and `/gallery/[slug]` album viewer page, and update the homepage gallery section to show the 5 most recent album cover photos with per-album lightbox.

**Architecture:** New `galleryAlbum` Sanity schema holds albums with an inline `photos` array. Three GROQ queries serve the gallery index, album detail, and homepage cover photos. UI splits into three new client components (`AlbumCard`, `AlbumGrid`, `AlbumViewer`) plus a modified `Gallery.tsx` for the homepage.

**Tech Stack:** Next.js 15 App Router, Sanity 3, `@sanity/image-url`, Tailwind CSS 4, `next-intl`, Vitest + React Testing Library.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| CREATE | `sanity/schemas/galleryAlbum.ts` | Sanity document type for albums |
| MODIFY | `sanity/schemas/index.ts` | Register `galleryAlbum` |
| MODIFY | `sanity/schemas/siteSettings.ts` | Remove `galleryImages` field |
| MODIFY | `lib/sanity/types.ts` | Add `SanityImageRef`, `GalleryPhoto`, `GalleryAlbum` |
| MODIFY | `lib/sanity/queries.ts` | Add 4 new GROQ queries, update `siteSettingsQuery` |
| MODIFY | `messages/en.json` | `galleryPage` keys + `nav.gallery` |
| MODIFY | `messages/sr.json` | `galleryPage` keys + `nav.gallery` |
| CREATE | `components/gallery/AlbumCard.tsx` | Album card (cover + title + date) |
| CREATE | `components/gallery/__tests__/AlbumCard.test.tsx` | Tests for AlbumCard |
| CREATE | `components/gallery/AlbumGrid.tsx` | Album grid with sort toggle |
| CREATE | `components/gallery/__tests__/AlbumGrid.test.tsx` | Tests for AlbumGrid |
| CREATE | `components/gallery/AlbumViewer.tsx` | Main image + thumbnail strip |
| CREATE | `components/gallery/__tests__/AlbumViewer.test.tsx` | Tests for AlbumViewer |
| CREATE | `app/[locale]/gallery/page.tsx` | Gallery index server component |
| CREATE | `app/[locale]/gallery/[slug]/page.tsx` | Album detail server component |
| MODIFY | `components/home/Gallery.tsx` | Accept albums instead of flat images |
| CREATE | `components/home/__tests__/Gallery.test.tsx` | Tests for updated Gallery |
| MODIFY | `app/[locale]/page.tsx` | Use `latestAlbumCoversQuery` |
| MODIFY | `components/layout/Nav.tsx` | Add gallery nav link |
| MODIFY | `components/layout/__tests__/Nav.test.tsx` | Expect gallery link |

---

## Task 1: Sanity schema + schema registration

**Files:**
- Create: `sanity/schemas/galleryAlbum.ts`
- Modify: `sanity/schemas/index.ts`
- Modify: `sanity/schemas/siteSettings.ts`

- [ ] **Step 1: Create `sanity/schemas/galleryAlbum.ts`**

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "galleryAlbum",
  title: "Gallery Album",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.sr", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [
        {
          type: "object" as const,
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({ name: "title", title: "Title", type: "localeString" }),
            defineField({ name: "description", title: "Description", type: "localeText" }),
          ],
          preview: {
            select: { media: "image", title: "title.sr" },
            prepare(v: { media: unknown; title?: string }) {
              return { title: v.title || "(untitled)", media: v.media };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    { title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" as const }] },
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" as const }] },
  ],
  preview: {
    select: { title: "title.sr", date: "date", media: "coverImage" },
    prepare(v: { title?: string; date?: string; media: unknown }) {
      return { title: v.title || "(untitled)", subtitle: v.date?.slice(0, 10), media: v.media };
    },
  },
});
```

- [ ] **Step 2: Register in `sanity/schemas/index.ts`**

Replace the file contents:

```ts
import localeString from "./localeString";
import localeText from "./localeText";
import localeBlock from "./localeBlock";
import newsArticle from "./newsArticle";
import event from "./event";
import practiceSession from "./practiceSession";
import sponsor from "./sponsor";
import siteSettings from "./siteSettings";
import galleryAlbum from "./galleryAlbum";

export const schemaTypes = [
  localeString,
  localeText,
  localeBlock,
  newsArticle,
  event,
  practiceSession,
  sponsor,
  siteSettings,
  galleryAlbum,
];
```

- [ ] **Step 3: Remove `galleryImages` field from `sanity/schemas/siteSettings.ts`**

Remove this line from the `fields` array (line 26):

```ts
defineField({ name: "galleryImages", title: "Gallery", type: "array", of: [{ type: "image" as const, options: { hotspot: true } }] }),
```

- [ ] **Step 4: Commit**

```bash
git add sanity/schemas/galleryAlbum.ts sanity/schemas/index.ts sanity/schemas/siteSettings.ts
git commit -m "feat: add galleryAlbum Sanity schema"
```

---

## Task 2: TypeScript types + GROQ queries

**Files:**
- Modify: `lib/sanity/types.ts`
- Modify: `lib/sanity/queries.ts`

- [ ] **Step 1: Add shared types to `lib/sanity/types.ts`**

Append to the existing file (after the `pickLocale` function):

```ts
export type SanityImageRef = { asset?: { _ref: string } } | null | undefined;

export type GalleryPhoto = {
  _key: string;
  image: SanityImageRef;
  title?: LocalizedString;
  description?: LocalizedText;
};

export type GalleryAlbum = {
  _id: string;
  title: LocalizedString;
  slug: string;
  date: string;
  order: number;
  coverImage: SanityImageRef;
  photos?: GalleryPhoto[];
};
```

- [ ] **Step 2: Add GROQ queries and update `siteSettingsQuery` in `lib/sanity/queries.ts`**

Update `siteSettingsQuery` to remove `galleryImages`:

```ts
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    title, description, ogImage, teamPhoto, mascotImage,
    "stats": stats[]{ value, label }
  }
`;
```

Append to the end of `lib/sanity/queries.ts`:

```ts
export const galleryAlbumsQuery = groq`
  *[_type == "galleryAlbum"] | order(order asc){
    _id, title, "slug": slug.current, date, order, coverImage
  }
`;

export const galleryAlbumBySlugQuery = groq`
  *[_type == "galleryAlbum" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, date, coverImage,
    "photos": photos[]{ _key, image, title, description }
  }
`;

export const allGallerySlugQuery = groq`
  *[_type == "galleryAlbum" && defined(slug.current)][].slug.current
`;

export const latestAlbumCoversQuery = groq`
  *[_type == "galleryAlbum"] | order(date desc)[0...5]{
    _id, title, "slug": slug.current, date, coverImage,
    "photos": photos[]{ _key, image, title, description }
  }
`;
```

- [ ] **Step 3: Commit**

```bash
git add lib/sanity/types.ts lib/sanity/queries.ts
git commit -m "feat: add GalleryAlbum types and GROQ queries"
```

---

## Task 3: i18n translation strings

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/sr.json`

- [ ] **Step 1: Add keys to `messages/en.json`**

In `"nav"`, add `"gallery": "Gallery"` so the object becomes:
```json
"nav": { "home": "Home", "news": "News", "events": "Events", "gallery": "Gallery", "join": "Join" },
```

Add a new top-level key after `"gallery"`:
```json
"galleryPage": {
  "eyebrow": "Gallery",
  "title": "Photo albums",
  "sortManual": "Manual order",
  "sortDate": "Newest first",
  "backToGallery": "Back to gallery",
  "photos": "photos",
  "empty": "No albums yet. Check back soon."
},
```

- [ ] **Step 2: Add keys to `messages/sr.json`**

In `"nav"`, add `"gallery": "Galerija"`:
```json
"nav": { "home": "Početna", "news": "Vesti", "events": "Događaji", "gallery": "Galerija", "join": "Pridruži se" },
```

Add a new top-level key:
```json
"galleryPage": {
  "eyebrow": "Galerija",
  "title": "Foto albumi",
  "sortManual": "Ručni redosled",
  "sortDate": "Najnoviji",
  "backToGallery": "Nazad na galeriju",
  "photos": "fotografija",
  "empty": "Još uvek nema albuma. Vratite se uskoro."
},
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/sr.json
git commit -m "feat: add gallery page i18n strings"
```

---

## Task 4: AlbumCard component

**Files:**
- Create: `components/gallery/AlbumCard.tsx`
- Create: `components/gallery/__tests__/AlbumCard.test.tsx`

- [ ] **Step 1: Write the failing test at `components/gallery/__tests__/AlbumCard.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import AlbumCard from "@/components/gallery/AlbumCard";

const mockAlbum = {
  slug: "test-album",
  title: "Summer Camp 2024",
  date: "2024-07-15",
  coverImageUrl: "https://cdn.sanity.io/test.jpg",
};

test("AlbumCard renders title", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByText("Summer Camp 2024")).toBeInTheDocument();
});

test("AlbumCard renders formatted date", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByText(/2024/)).toBeInTheDocument();
});

test("AlbumCard links to album slug", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/gallery/test-album");
});

test("AlbumCard renders cover image", () => {
  render(<AlbumCard {...mockAlbum} />);
  expect(screen.getByRole("img")).toHaveAttribute("src", mockAlbum.coverImageUrl);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/gallery/__tests__/AlbumCard.test.tsx
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create `components/gallery/AlbumCard.tsx`**

```tsx
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface AlbumCardProps {
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string | null;
}

export default function AlbumCard({ slug, title, date, coverImageUrl }: AlbumCardProps) {
  const formatted = new Date(date).toLocaleDateString("sr-Latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/gallery/${slug}`} className="group block rounded-lg overflow-hidden border border-surface-700 bg-surface-900 hover:border-cones-blue transition-colors">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-800">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-surface-600 text-4xl">📷</div>
        )}
      </div>
      <div className="p-4">
        <p className="font-heading text-xs uppercase tracking-widest text-surface-400 mb-1">{formatted}</p>
        <h3 className="font-display text-lg text-surface-50 group-hover:text-cones-blue transition-colors line-clamp-2">{title}</h3>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/gallery/__tests__/AlbumCard.test.tsx
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/gallery/AlbumCard.tsx components/gallery/__tests__/AlbumCard.test.tsx
git commit -m "feat: add AlbumCard component"
```

---

## Task 5: AlbumGrid component

**Files:**
- Create: `components/gallery/AlbumGrid.tsx`
- Create: `components/gallery/__tests__/AlbumGrid.test.tsx`

- [ ] **Step 1: Write the failing test at `components/gallery/__tests__/AlbumGrid.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import AlbumGrid from "@/components/gallery/AlbumGrid";

const albums = [
  { _id: "1", slug: "album-a", title: "Album A", date: "2024-01-01", coverImageUrl: null, order: 2 },
  { _id: "2", slug: "album-b", title: "Album B", date: "2024-06-01", coverImageUrl: null, order: 1 },
];

test("AlbumGrid renders all album titles", () => {
  render(
    <AlbumGrid albums={albums} sortManualLabel="Manual order" sortDateLabel="Newest first" />
  );
  expect(screen.getByText("Album A")).toBeInTheDocument();
  expect(screen.getByText("Album B")).toBeInTheDocument();
});

test("AlbumGrid shows sort toggle buttons", () => {
  render(
    <AlbumGrid albums={albums} sortManualLabel="Manual order" sortDateLabel="Newest first" />
  );
  expect(screen.getByRole("button", { name: /manual order/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /newest first/i })).toBeInTheDocument();
});

test("AlbumGrid sorts by date when Newest first clicked", async () => {
  render(
    <AlbumGrid albums={albums} sortManualLabel="Manual order" sortDateLabel="Newest first" />
  );
  await userEvent.click(screen.getByRole("button", { name: /newest first/i }));
  const links = screen.getAllByRole("link");
  expect(links[0]).toHaveAttribute("href", "/gallery/album-b");
  expect(links[1]).toHaveAttribute("href", "/gallery/album-a");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/gallery/__tests__/AlbumGrid.test.tsx
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create `components/gallery/AlbumGrid.tsx`**

```tsx
"use client";
import { useState } from "react";
import AlbumCard from "@/components/gallery/AlbumCard";

interface Album {
  _id: string;
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string | null;
  order: number;
}

interface AlbumGridProps {
  albums: Album[];
  sortManualLabel: string;
  sortDateLabel: string;
}

type SortMode = "manual" | "date";

export default function AlbumGrid({ albums, sortManualLabel, sortDateLabel }: AlbumGridProps) {
  const [sort, setSort] = useState<SortMode>("manual");

  const sorted = [...albums].sort((a, b) => {
    if (sort === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
    return a.order - b.order;
  });

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {(["manual", "date"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSort(mode)}
            className={`px-4 py-2 font-heading text-xs uppercase tracking-widest rounded-md border transition-colors cursor-pointer ${
              sort === mode
                ? "border-cones-blue text-cones-blue"
                : "border-surface-600 text-surface-400 hover:border-surface-400 hover:text-surface-200"
            }`}
          >
            {mode === "manual" ? sortManualLabel : sortDateLabel}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((album) => (
            <AlbumCard
              key={album._id}
              slug={album.slug}
              title={album.title}
              date={album.date}
              coverImageUrl={album.coverImageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Install `@testing-library/user-event` if not already present**

```bash
pnpm list @testing-library/user-event
```

If not installed: `pnpm add -D @testing-library/user-event`

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run components/gallery/__tests__/AlbumGrid.test.tsx
```

Expected: 3 tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/gallery/AlbumGrid.tsx components/gallery/__tests__/AlbumGrid.test.tsx
git commit -m "feat: add AlbumGrid component with sort toggle"
```

---

## Task 6: AlbumViewer component

**Files:**
- Create: `components/gallery/AlbumViewer.tsx`
- Create: `components/gallery/__tests__/AlbumViewer.test.tsx`

- [ ] **Step 1: Write the failing test at `components/gallery/__tests__/AlbumViewer.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import AlbumViewer from "@/components/gallery/AlbumViewer";

const photos = [
  { _key: "k1", imageUrl: "https://cdn.sanity.io/1.jpg", title: "Photo 1" },
  { _key: "k2", imageUrl: "https://cdn.sanity.io/2.jpg", title: "Photo 2" },
  { _key: "k3", imageUrl: "https://cdn.sanity.io/3.jpg", title: "Photo 3" },
];

const defaultProps = {
  photos,
  albumTitle: "Test Album",
  date: "2024-07-15",
  backLabel: "Back to gallery",
  backHref: "/gallery",
};

test("AlbumViewer renders album title", () => {
  render(<AlbumViewer {...defaultProps} />);
  expect(screen.getByText("Test Album")).toBeInTheDocument();
});

test("AlbumViewer renders back link", () => {
  render(<AlbumViewer {...defaultProps} />);
  expect(screen.getByRole("link", { name: /back to gallery/i })).toHaveAttribute("href", "/gallery");
});

test("AlbumViewer shows first photo by default", () => {
  render(<AlbumViewer {...defaultProps} />);
  const images = screen.getAllByRole("img");
  expect(images[0]).toHaveAttribute("src", "https://cdn.sanity.io/1.jpg");
});

test("AlbumViewer renders all thumbnails", () => {
  render(<AlbumViewer {...defaultProps} />);
  expect(screen.getAllByRole("img")).toHaveLength(photos.length + 1); // main + thumbnails
});

test("AlbumViewer clicking thumbnail changes main image", () => {
  render(<AlbumViewer {...defaultProps} />);
  const thumbnails = screen.getAllByRole("button");
  fireEvent.click(thumbnails[1]);
  const images = screen.getAllByRole("img");
  expect(images[0]).toHaveAttribute("src", "https://cdn.sanity.io/2.jpg");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/gallery/__tests__/AlbumViewer.test.tsx
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create `components/gallery/AlbumViewer.tsx`**

```tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface Photo {
  _key: string;
  imageUrl: string;
  title: string;
}

interface AlbumViewerProps {
  photos: Photo[];
  albumTitle: string;
  date: string;
  backLabel: string;
  backHref: string;
}

export default function AlbumViewer({ photos, albumTitle, date, backLabel, backHref }: AlbumViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (photos.length === 0) return null;

  const active = photos[activeIndex];
  const formatted = new Date(date).toLocaleDateString("sr-Latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mx-auto max-w-container px-6 mb-6 flex items-center gap-4">
        <Link
          href={backHref}
          className="font-heading text-xs uppercase tracking-widest text-surface-400 hover:text-cones-blue transition-colors flex items-center gap-1"
        >
          ← {backLabel}
        </Link>
      </div>

      <div className="mx-auto max-w-container px-6 mb-4">
        <p className="font-heading text-xs uppercase tracking-widest text-surface-400 mb-1">{formatted}</p>
        <h1 className="font-display text-3xl md:text-4xl text-surface-50">{albumTitle}</h1>
        <p className="text-sm text-surface-400 mt-1">{activeIndex + 1} / {photos.length}</p>
      </div>

      {/* Main image */}
      <div className="relative w-full h-[55vh] md:h-[70vh] bg-surface-900 mb-4">
        <Image
          src={active.imageUrl}
          alt={active.title || albumTitle}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="mx-auto max-w-container px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, i) => (
              <button
                key={photo._key}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded overflow-hidden border-2 transition-colors cursor-pointer ${
                  i === activeIndex ? "border-cones-blue" : "border-surface-700 hover:border-surface-400"
                }`}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title || `Photo ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/gallery/__tests__/AlbumViewer.test.tsx
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/gallery/AlbumViewer.tsx components/gallery/__tests__/AlbumViewer.test.tsx
git commit -m "feat: add AlbumViewer component with thumbnail strip"
```

---

## Task 7: Gallery index page

**Files:**
- Create: `app/[locale]/gallery/page.tsx`

- [ ] **Step 1: Create `app/[locale]/gallery/page.tsx`**

```tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { galleryAlbumsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import type { GalleryAlbum } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import SectionHeading from "@/components/ui/SectionHeading";
import AlbumGrid from "@/components/gallery/AlbumGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galleryPage" });
  return { title: t("title") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "galleryPage" });

  let albums: GalleryAlbum[] = [];
  try {
    albums = await sanityFetch<GalleryAlbum[]>({
      query: galleryAlbumsQuery,
      tags: ["galleryAlbum"],
    });
  } catch {
    albums = [];
  }

  const gridAlbums = albums.map((a) => ({
    _id: a._id,
    slug: a.slug,
    title: pickLocale(a.title, locale),
    date: a.date,
    order: a.order ?? 0,
    coverImageUrl: a.coverImage?.asset
      ? urlFor(a.coverImage).width(800).height(600).fit("crop").url()
      : null,
  }));

  return (
    <main className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <div className="mb-12">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        </div>

        {gridAlbums.length === 0 ? (
          <p className="text-surface-400">{t("empty")}</p>
        ) : (
          <AlbumGrid
            albums={gridAlbums}
            sortManualLabel={t("sortManual")}
            sortDateLabel={t("sortDate")}
          />
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/gallery/page.tsx"
git commit -m "feat: add gallery index page"
```

---

## Task 8: Album detail page

**Files:**
- Create: `app/[locale]/gallery/[slug]/page.tsx`

- [ ] **Step 1: Create `app/[locale]/gallery/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { galleryAlbumBySlugQuery, allGallerySlugQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import type { GalleryAlbum } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import AlbumViewer from "@/components/gallery/AlbumViewer";

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[]>({
      query: allGallerySlugQuery,
      tags: ["galleryAlbum"],
    });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

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
    return { title: pickLocale(album.title, locale) };
  } catch {
    return {};
  }
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "galleryPage" });

  let album: GalleryAlbum | null = null;
  try {
    album = await sanityFetch<GalleryAlbum | null>({
      query: galleryAlbumBySlugQuery,
      params: { slug },
      tags: ["galleryAlbum"],
    });
  } catch {
    album = null;
  }

  if (!album) notFound();

  const photos = (album.photos ?? [])
    .filter((p) => p.image?.asset)
    .map((p) => ({
      _key: p._key,
      imageUrl: urlFor(p.image!).width(1400).height(900).fit("max").url(),
      title: pickLocale(p.title, locale),
    }));

  return (
    <AlbumViewer
      photos={photos}
      albumTitle={pickLocale(album.title, locale)}
      date={album.date}
      backLabel={t("backToGallery")}
      backHref="/gallery"
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/gallery/[slug]/page.tsx"
git commit -m "feat: add album detail page"
```

---

## Task 9: Update homepage Gallery component

**Files:**
- Modify: `components/home/Gallery.tsx`
- Create: `components/home/__tests__/Gallery.test.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Write failing test at `components/home/__tests__/Gallery.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock("@/components/motion/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/SectionHeading", () => ({
  default: () => <div>Section Heading</div>,
}));
vi.mock("@/components/ui/Lightbox", () => ({
  default: ({ images }: { images: string[] }) => <div data-testid="lightbox" data-count={images.length} />,
}));

import Gallery from "@/components/home/Gallery";

const albums = [
  {
    _id: "1",
    slug: "album-1",
    coverImageUrl: "https://cdn.sanity.io/cover1.jpg",
    photos: [
      { _key: "p1", imageUrl: "https://cdn.sanity.io/photo1.jpg" },
      { _key: "p2", imageUrl: "https://cdn.sanity.io/photo2.jpg" },
    ],
  },
  {
    _id: "2",
    slug: "album-2",
    coverImageUrl: "https://cdn.sanity.io/cover2.jpg",
    photos: [{ _key: "p3", imageUrl: "https://cdn.sanity.io/photo3.jpg" }],
  },
];

test("Gallery renders cover images", () => {
  render(<Gallery albums={albums} />);
  const images = screen.getAllByRole("img");
  expect(images[0]).toHaveAttribute("src", "https://cdn.sanity.io/cover1.jpg");
});

test("Gallery renders without crashing when albums is empty", () => {
  render(<Gallery albums={[]} />);
  expect(screen.getByText("Section Heading")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/home/__tests__/Gallery.test.tsx
```

Expected: FAIL (Gallery doesn't accept `albums` prop yet)

- [ ] **Step 3: Replace `components/home/Gallery.tsx` with the updated version**

```tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import Lightbox from "@/components/ui/Lightbox";

interface AlbumCover {
  _id: string;
  slug: string;
  coverImageUrl: string | null;
  photos: Array<{ _key: string; imageUrl: string }>;
}

const LOCAL_COVERS = [
  { _id: "l1", slug: "", coverImageUrl: "/images/gallery/gallery-1.jpg", photos: [] },
  { _id: "l2", slug: "", coverImageUrl: "/images/gallery/gallery-2.jpg", photos: [] },
  { _id: "l3", slug: "", coverImageUrl: "/images/gallery/gallery-3.jpg", photos: [] },
  { _id: "l4", slug: "", coverImageUrl: "/images/gallery/gallery-4.jpg", photos: [] },
];

const mosaicClasses = [
  "md:col-span-6 md:row-span-2 aspect-[4/3] md:aspect-auto",
  "md:col-span-6 aspect-[4/3] md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
];

interface LightboxState {
  albumIndex: number;
  photoIndex: number;
}

export default function Gallery({ albums }: { albums: AlbumCover[] }) {
  const t = useTranslations("gallery");
  const slots = albums.length ? albums.slice(0, 4) : LOCAL_COVERS;
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const openLightbox = (albumIndex: number) => {
    setLightbox({ albumIndex, photoIndex: 0 });
  };

  const activeAlbum = lightbox !== null ? slots[lightbox.albumIndex] : null;
  const lightboxImages = activeAlbum?.photos.map((p) => p.imageUrl) ?? [];

  return (
    <section className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="hidden md:flex items-center gap-2 border border-surface-600 px-5 py-3 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors cursor-pointer rounded-md whitespace-nowrap"
          >
            {t("viewAll")} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3 md:h-[460px]">
          {slots.map((album, i) => (
            <Reveal key={album._id} delay={i * 0.06} className={mosaicClasses[i]}>
              <button
                type="button"
                onClick={() => openLightbox(i)}
                className="relative w-full h-full overflow-hidden rounded-lg border border-surface-700 group cursor-zoom-in block"
              >
                {album.coverImageUrl && (
                  <Image
                    src={album.coverImageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-3xl select-none">⊕</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex md:hidden">
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="flex items-center gap-2 border border-surface-600 px-5 py-3 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors cursor-pointer rounded-md"
          >
            {t("viewAll")} →
          </button>
        </div>
      </div>

      {lightbox !== null && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          index={lightbox.photoIndex}
          onClose={() => setLightbox(null)}
          onNav={(idx) => setLightbox((prev) => prev ? { ...prev, photoIndex: idx } : null)}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/home/__tests__/Gallery.test.tsx
```

Expected: 2 tests PASS

- [ ] **Step 5: Update `app/[locale]/page.tsx`**

Replace the import line:
```ts
import { siteSettingsQuery, featuredNewsQuery, sponsorsQuery } from "@/lib/sanity/queries";
```
with:
```ts
import { siteSettingsQuery, featuredNewsQuery, sponsorsQuery, latestAlbumCoversQuery } from "@/lib/sanity/queries";
```

Replace the `Settings` type — remove `galleryImages`:
```ts
type Settings = {
  stats?: Array<{ value: string; label: { sr?: string; en?: string } }>;
  teamPhoto?: SanityImageRef;
  mascotImage?: SanityImageRef;
};
```

Add `SanityImageRef` and `GalleryAlbum` imports from `lib/sanity/types`:
```ts
import { pickLocale, type SanityImageRef, type GalleryAlbum } from "@/lib/sanity/types";
```

Remove the existing `import { pickLocale } from "@/lib/sanity/types";` line (it will be merged into the above).

Add a `LatestAlbum` local type below `SponsorDoc`:
```ts
type LatestAlbumDoc = GalleryAlbum & {
  photos?: Array<{ _key: string; image: SanityImageRef }>;
};
```

In the `Promise.all`, add the gallery fetch:
```ts
const [settings, news, sponsors, latestAlbums] = await Promise.all([
  safeFetch(() => sanityFetch<Settings | null>({ query: siteSettingsQuery, tags: ["siteSettings"] }), null),
  safeFetch(() => sanityFetch<NewsDoc[]>({ query: featuredNewsQuery, tags: ["news"] }), []),
  safeFetch(() => sanityFetch<SponsorDoc[]>({ query: sponsorsQuery, tags: ["sponsor"] }), []),
  safeFetch(() => sanityFetch<LatestAlbumDoc[]>({ query: latestAlbumCoversQuery, tags: ["galleryAlbum"] }), []),
]);
```

Remove the `galleryUrls` derivation block and replace with:
```ts
const galleryAlbums = latestAlbums.map((a) => ({
  _id: a._id,
  slug: a.slug,
  coverImageUrl: a.coverImage?.asset
    ? urlFor(a.coverImage).width(1200).height(800).fit("crop").url()
    : null,
  photos: (a.photos ?? [])
    .filter((p) => p.image?.asset)
    .map((p) => ({
      _key: p._key,
      imageUrl: urlFor(p.image!).width(1400).height(900).fit("max").url(),
    })),
}));
```

Replace `<Gallery images={galleryUrls} />` with:
```tsx
<Gallery albums={galleryAlbums} />
```

- [ ] **Step 6: Commit**

```bash
git add components/home/Gallery.tsx components/home/__tests__/Gallery.test.tsx "app/[locale]/page.tsx"
git commit -m "feat: update homepage gallery to use album cover photos"
```

---

## Task 10: Add Gallery to navigation

**Files:**
- Modify: `components/layout/Nav.tsx`
- Modify: `components/layout/__tests__/Nav.test.tsx`

- [ ] **Step 1: Update the Nav test to expect a gallery link**

Replace the first test in `components/layout/__tests__/Nav.test.tsx`:

```ts
test("Nav renders four nav links", () => {
  render(<Nav />);
  expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /news/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /gallery/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/layout/__tests__/Nav.test.tsx
```

Expected: FAIL — no gallery link found

- [ ] **Step 3: Add gallery link to `components/layout/Nav.tsx`**

Replace the `links` array:
```ts
const links = [
  { href: "/" as const, label: t("home") },
  { href: "/news" as const, label: t("news") },
  { href: "/events" as const, label: t("events") },
  { href: "/gallery" as const, label: t("gallery") },
];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/layout/__tests__/Nav.test.tsx
```

Expected: 2 tests PASS

- [ ] **Step 5: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add components/layout/Nav.tsx components/layout/__tests__/Nav.test.tsx
git commit -m "feat: add gallery link to navigation"
```
