# Gallery Albums — Design Spec

**Date:** 2026-04-20  
**Status:** Approved

---

## Overview

Replace the current flat `siteSettings.galleryImages` array with a structured `galleryAlbum` document type in Sanity. Add a dedicated `/gallery` page with an album grid and individual album viewer pages. Update the homepage gallery section to show the 5 most recent album cover photos with per-album lightbox support.

---

## 1. Sanity Schema

### New document type: `galleryAlbum`

File: `/sanity/schemas/galleryAlbum.ts`

| Field | Type | Notes |
|---|---|---|
| `title` | `localeString` | sr + en, required |
| `slug` | `slug` | auto-generated from `title.sr`, required |
| `date` | `datetime` | required, used for sorting |
| `order` | `number` | manual drag-order in Studio |
| `coverImage` | `image` (hotspot) | required |
| `photos` | array of inline objects | see below |

**Photo inline object fields:**

| Field | Type | Notes |
|---|---|---|
| `image` | `image` (hotspot) | required |
| `title` | `localeString` | optional |
| `description` | `localeText` | optional |

Register in `/sanity/schemas/index.ts`.

The existing `siteSettings.galleryImages` field is removed once the homepage is updated to use `latestAlbumCoversQuery`.

---

## 2. GROQ Queries

Added to `/lib/sanity/queries.ts`:

**`galleryAlbumsQuery`**  
Fetches all albums for the gallery index page. Returns `_id`, `title`, `slug`, `date`, `order`, `coverImage`. No photos included (keeps payload small).

**`galleryAlbumQuery(slug)`**  
Fetches a single album by slug. Returns all fields including full `photos` array (image, title, description).

**`latestAlbumCoversQuery`**  
Fetches the 5 most recent albums sorted by `date desc`. Returns `_id`, `title`, `slug`, `date`, `coverImage`, and the full `photos` array. Used by the homepage — photos included to avoid a secondary fetch when the lightbox opens.

---

## 3. Routing

New routes under `/app/[locale]/`:

| Route | File | Type |
|---|---|---|
| `/gallery` | `app/[locale]/gallery/page.tsx` | Server component |
| `/gallery/[slug]` | `app/[locale]/gallery/[slug]/page.tsx` | Server component |

**`/gallery` page:**
- Fetches `galleryAlbumsQuery`
- Renders `AlbumGrid` client component
- Supports `?sort=date` URL param for client-side sort toggle (no reload)

**`/gallery/[slug]` page:**
- Fetches `galleryAlbumQuery(slug)`
- Renders `AlbumViewer` client component
- Generates static params from all album slugs (`generateStaticParams`)

---

## 4. Components

### New components

**`/components/gallery/AlbumCard.tsx`** — Server/presentational  
Displays cover image, localized title, formatted date. Links to `/gallery/[slug]`.

**`/components/gallery/AlbumGrid.tsx`** — Client component  
Receives albums array. Manages sort state (manual order vs date). Renders responsive CSS grid of `AlbumCard`.

**`/components/gallery/AlbumViewer.tsx`** — Client component  
Manages selected photo index state. Layout:
- Large main image (full viewport width, fixed height)
- Horizontally scrollable thumbnail strip below
- Clicking a thumbnail swaps the main image
- Keyboard navigation: left/right arrow keys, Escape to go back
- Album title + date in header

### Modified components

**`/components/home/Gallery.tsx`**  
Updated to accept `albums` (array of `{ _id, title, slug, date, coverImage, photos }`). Mosaic layout unchanged — renders 5 cover photos. Clicking a cover opens `Lightbox` with that album's `photos` array. No secondary fetch needed (photos included in `latestAlbumCoversQuery`).

**`/lib/sanity/queries.ts`**  
Three new queries added (see Section 2). Existing queries unchanged.

**`/sanity/schemas/index.ts`**  
`galleryAlbum` added to exports.

### Unchanged components

`/components/ui/Lightbox.tsx` — no changes. Already supports array navigation with prev/next and keyboard controls.

---

## 5. Data Flow

```
Homepage
  page.tsx (server)
    → latestAlbumCoversQuery → 5 albums (with photos)
    → Gallery.tsx (client)
        → mosaic of 5 cover photos
        → click → Lightbox with album.photos[]

/gallery
  page.tsx (server)
    → galleryAlbumsQuery → all albums (no photos)
    → AlbumGrid.tsx (client)
        → sort toggle (manual / date)
        → AlbumCard grid → links to /gallery/[slug]

/gallery/[slug]
  page.tsx (server)
    → galleryAlbumQuery(slug) → single album with photos
    → AlbumViewer.tsx (client)
        → main image + thumbnail strip
        → keyboard navigation
```

---

## 6. Localization

All user-facing text fields use `localeString` or `localeText`. Route stays under `/app/[locale]/` — no changes to i18n config needed. Translation keys for UI labels (e.g. sort toggle, "back to gallery") added to `/messages/sr.json` and `/messages/en.json`.

---

## 7. Out of Scope

- Pagination on the `/gallery` page (albums grid loads all at once)
- Photo upload directly from the website (Sanity Studio only)
- Comments or likes on photos
- Sharing individual photos
