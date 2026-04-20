# Cones Belgrade

Production website for Cones Belgrade ice hockey club. Next.js 15 App Router, bilingual (Serbian primary, English), Sanity CMS, Framer Motion, Tailwind CSS.

## Requirements
- Node 20+
- pnpm 9+
- A Sanity project (project id + dataset)

## Local setup
1. `cp .env.local.example .env.local` and fill in Sanity project id + dataset.
2. `pnpm install`
3. `pnpm dev` — app at http://localhost:3000
4. Studio at http://localhost:3000/studio (wire env to deploy schema, then `pnpm sanity deploy` if desired).

## Commands
- `pnpm dev` — dev server
- `pnpm build` / `pnpm start` — production build + serve
- `pnpm test` — unit tests (vitest)
- `pnpm e2e` — Playwright smoke tests (runs build + start)
- `pnpm lint` — ESLint

## Sanity content types
- **newsArticle** — news posts with title, slug, cover image, body (PortableText), categories, publishedAt. Localized: `{ sr, en }`.
- **event** — upcoming/past events with title, date, venue, description, RSVP. Localized.
- **practiceSession** — recurring practice schedule (day, time, venue, level). Localized.
- **sponsor** — sponsor name, logo, website, display order.
- **siteSettings** — global site name, tagline, social links, hero stats.

## Environment variables
See `.env.local.example`. Required for production:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` — Sanity dataset (e.g. `production`)
- `SITE_URL` — canonical URL (e.g. `https://conesbelgrade.rs`)
- `SANITY_REVALIDATE_SECRET` — shared secret for ISR webhook

## ISR revalidation
When content changes in Sanity, trigger `POST /api/revalidate` with header `x-revalidate-secret: <SANITY_REVALIDATE_SECRET>` and JSON body:
- `{ "tag": "news" }` — revalidates all news pages
- `{ "_type": "event" }` — revalidates events
- `{ "slug": "my-article-slug" }` — revalidates specific article

## Deploy
Deploy to Vercel (recommended). Set all environment variables in the Vercel dashboard. The app uses Next.js ISR — pages rebuild on-demand after Sanity content updates via the revalidation webhook.
