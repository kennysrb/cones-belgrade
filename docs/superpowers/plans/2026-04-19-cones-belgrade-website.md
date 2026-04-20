# Cones Belgrade Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production-ready Cones Belgrade (professional amateur ice hockey club, Belgrade) marketing website in Next.js, bilingual Serbian (primary) + English, with Tailwind CSS, next-intl, Sanity CMS for news/events/practice schedules, Framer Motion animations, and full SEO.

**Architecture:** Next.js 15 App Router with `[locale]` segment routing (`sr` default, `en` secondary) powered by `next-intl`. All content is split into (a) **static UI strings** in `messages/sr.json` & `messages/en.json` and (b) **dynamic content** (news articles, events, practice sessions, sponsors) stored in Sanity with localized fields (`{ sr, en }` pattern). Tailwind carries the design tokens from the provided design system (`shared.css`) — colors, typography, spacing, radii — extended via `tailwind.config.ts`. Framer Motion handles section reveal, ticker, gallery hover, tab transitions. SEO: per-route generateMetadata, hreflang alternates, sitemap.ts, robots.ts, JSON-LD for SportsTeam + NewsArticle + Event.

**Tech Stack:** Next.js 15 (App Router, TypeScript), next-intl v3+, Tailwind CSS v4, Sanity CMS (`@sanity/client`, `next-sanity`), Framer Motion, Zod (env + form validation), next/font (Bebas Neue, Barlow Condensed, Inter), Vitest + React Testing Library for component tests, Playwright for smoke e2e.

**Reference:** The extracted design bundle lives in `docs/design-reference/` — `index.html`, `blog.html`, `events.html`, `Design System.html`, `shared.css`. Treat `shared.css` as the source of truth for tokens. Treat the HTML files as visual specs: match the layout, spacing, and copy tone pixel-fairly; don't copy their inline styles or vanilla JS into React components.

---

## File Structure

Top-level (created in Task 1):

```
cones-belgrade/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx               # locale-aware root (html lang, fonts, NextIntlClientProvider)
│   │   ├── page.tsx                 # homepage
│   │   ├── news/
│   │   │   ├── page.tsx             # news listing
│   │   │   └── [slug]/page.tsx      # news article detail
│   │   ├── events/page.tsx          # events + practice schedule
│   │   └── not-found.tsx
│   ├── api/rsvp/route.ts            # RSVP form handler
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── manifest.ts
│   └── globals.css
├── components/
│   ├── layout/{Nav,Footer,LocaleSwitcher}.tsx
│   ├── ui/{Button,Badge,Card,Input,SectionHeading,StatBlock}.tsx
│   ├── home/{Hero,About,Gallery,NewsStrip,SponsorTicker,CtaBand}.tsx
│   ├── news/{ArticleCard,ArticleGrid,CategoryFilter,ArticleBody}.tsx
│   ├── events/{EventsTabs,EventCard,PracticeTable,RsvpForm}.tsx
│   └── motion/{Reveal,Ticker}.tsx
├── lib/
│   ├── sanity/{client,queries,image,types}.ts
│   ├── seo/{metadata,jsonLd}.ts
│   └── utils/{cn,formatDate}.ts
├── messages/{sr.json,en.json}
├── i18n/{routing.ts,request.ts,navigation.ts}
├── sanity/
│   ├── schemas/{newsArticle,event,practiceSession,sponsor,siteSettings,localeString,localeText,localeBlock}.ts
│   ├── schemas/index.ts
│   └── sanity.config.ts
├── middleware.ts                    # next-intl middleware
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .env.local.example
└── package.json
```

This layout keeps locale-aware pages inside `app/[locale]`, CMS access under `lib/sanity`, SEO helpers in `lib/seo`, and component types split by feature (home/news/events). Framer Motion wrappers live in `components/motion` so any component can consume a single `<Reveal>` primitive.

---

## Phase 1 — Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `app/globals.css`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`

- [ ] **Step 1: Initialize project with pinned toolchain**

Run:
```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-pnpm --no-turbopack
```
Accept defaults for everything else. Expected: project files created in current dir.

- [ ] **Step 2: Install runtime dependencies**

Run:
```bash
pnpm add next-intl@^3 framer-motion@^11 @sanity/client@^6 next-sanity@^9 @sanity/image-url@^1 zod@^3 clsx@^2 tailwind-merge@^2
```
Expected: dependencies added to `package.json`, lockfile updated.

- [ ] **Step 3: Install dev dependencies**

Run:
```bash
pnpm add -D vitest@^2 @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node @playwright/test
```
Expected: dev dependencies added.

- [ ] **Step 4: Replace `app/page.tsx` placeholder with a temporary locale redirect stub**

Replace `app/page.tsx` content with:
```tsx
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/sr");
}
```

- [ ] **Step 5: Create initial locale route**

Create `app/[locale]/layout.tsx`:
```tsx
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}
```

And `app/[locale]/page.tsx`:
```tsx
export default function Page({ params }: { params: { locale: string } }) {
  return <main>Cones Belgrade — {params.locale.toUpperCase()} placeholder</main>;
}
```

Delete the default `app/layout.tsx` so locale layout owns `<html>`.

- [ ] **Step 6: Verify dev server boots**

Run: `pnpm dev`
Expected: server on `http://localhost:3000`, visiting `/sr` renders "Cones Belgrade — SR placeholder". Stop the server after verifying.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js app with locale segment and core deps"
```

---

### Task 2: Wire Tailwind design tokens

**Files:**
- Create: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Write failing token smoke test**

Create `components/ui/__tests__/tokens.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

test("tailwind design tokens are available via arbitrary values", () => {
  const { container } = render(<div className="bg-cones-blue text-cones-orange">x</div>);
  const el = container.firstChild as HTMLElement;
  expect(el.className).toContain("bg-cones-blue");
  expect(el.className).toContain("text-cones-orange");
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm vitest run components/ui/__tests__/tokens.test.tsx`
Expected: FAIL (vitest not configured yet OR class names not recognized). Fine either way — this test becomes meaningful after Tailwind tokens land + vitest config (Task 3).

- [ ] **Step 3: Write Tailwind config with Cones tokens**

Create `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cones: {
          blue: "#00ADF1",
          "blue-dark": "#0091CC",
          orange: "#F7941C",
          "orange-dark": "#E07A00",
          black: "#0A0C10",
        },
        surface: {
          900: "#0A0C10",
          800: "#11141B",
          700: "#171B24",
          600: "#1E2330",
          500: "#272D3D",
          400: "#3A4255",
          300: "#5B6478",
          200: "#8892A6",
          100: "#B8C0CF",
          50: "#E4E8F0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        heading: ["var(--font-heading)", "Inter", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: { container: "1280px" },
      spacing: { nav: "72px" },
      borderRadius: { pill: "9999px" },
      boxShadow: {
        "cones-blue": "0 10px 30px -10px rgba(0, 173, 241, 0.45)",
        "cones-orange": "0 10px 30px -10px rgba(247, 148, 28, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Replace `app/globals.css` with token + reset baseline**

Replace with:
```css
@import "tailwindcss";

@theme {
  --font-display: "Bebas Neue", Impact, sans-serif;
  --font-heading: "Barlow Condensed", Inter, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}

:root {
  color-scheme: dark;
}

html,
body {
  background: #0A0C10;
  color: #E4E8F0;
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: #00ADF1;
  color: #0A0C10;
}
```

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: wire tailwind design tokens for cones brand"
```

---

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Create setup file**

Create `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add test script**

Edit `package.json` `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Run the token test from Task 2**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore: configure vitest with jsdom + RTL"
```

---

### Task 4: Load brand fonts with next/font

**Files:**
- Create: `lib/fonts.ts`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create font loader**

Create `lib/fonts.ts`:
```ts
import { Bebas_Neue, Barlow_Condensed, Inter } from "next/font/google";

export const display = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const heading = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
```

Note: `latin-ext` subset is required for Serbian Latin diacritics (č, ć, š, ž, đ).

- [ ] **Step 2: Apply font variables to html**

Replace `app/[locale]/layout.tsx`:
```tsx
import "@/app/globals.css";
import { display, heading, body } from "@/lib/fonts";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html
      lang={params.locale}
      className={`${display.variable} ${heading.variable} ${body.variable}`}
    >
      <body className="bg-cones-black text-surface-50 font-body antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify fonts load**

Run: `pnpm dev` and load `/sr`. Expected: no console errors, Inter renders as body font. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add lib/fonts.ts app/[locale]/layout.tsx
git commit -m "feat: load bebas neue, barlow condensed, inter via next/font"
```

---

## Phase 2 — Internationalization

### Task 5: Install and configure next-intl routing

**Files:**
- Create: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`, `middleware.ts`, `messages/sr.json`, `messages/en.json`
- Modify: `next.config.ts`, `app/[locale]/layout.tsx`, `app/page.tsx` (delete)

- [ ] **Step 1: Write failing routing test**

Create `i18n/__tests__/routing.test.ts`:
```ts
import { routing } from "@/i18n/routing";

test("sr is the default locale", () => {
  expect(routing.defaultLocale).toBe("sr");
});

test("both sr and en are supported", () => {
  expect(routing.locales).toEqual(["sr", "en"]);
});

test("default locale path is not prefixed", () => {
  expect(routing.localePrefix).toBe("as-needed");
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm test i18n/__tests__/routing.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Define routing**

Create `i18n/routing.ts`:
```ts
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
```

- [ ] **Step 4: Create navigation wrappers**

Create `i18n/navigation.ts`:
```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 5: Create request config**

Create `i18n/request.ts`:
```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 6: Create middleware**

Create `middleware.ts`:
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 7: Register plugin in Next config**

Replace `next.config.ts`:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 8: Delete the root redirect stub**

Run: `rm app/page.tsx`
Rationale: next-intl middleware handles the `/` → `/sr` redirect (or serves `/` unprefixed depending on detection) — a static root page would shadow it.

- [ ] **Step 9: Create base message files**

Create `messages/sr.json`:
```json
{
  "nav": { "home": "Početna", "news": "Vesti", "events": "Događaji", "join": "Pridruži se" },
  "hero": {
    "eyebrow": "Najbolji hokejaški klub Beograda",
    "titleLine1": "CONES",
    "titleLine2": "BELGRADE",
    "lead": "Hokej na ledu u srcu Beograda. Strast, timski duh i fer-plej od 2014. godine.",
    "ctaPrimary": "Pridruži se timu",
    "ctaSecondary": "Saznaj više"
  },
  "common": { "readMore": "Pročitaj više", "loading": "Učitavanje…" }
}
```

Create `messages/en.json`:
```json
{
  "nav": { "home": "Home", "news": "News", "events": "Events", "join": "Join" },
  "hero": {
    "eyebrow": "Belgrade's finest hockey club",
    "titleLine1": "CONES",
    "titleLine2": "BELGRADE",
    "lead": "Ice hockey at the heart of Belgrade. Passion, teamwork, and fair play since 2014.",
    "ctaPrimary": "Join the team",
    "ctaSecondary": "Learn more"
  },
  "common": { "readMore": "Read more", "loading": "Loading…" }
}
```

- [ ] **Step 10: Wrap locale layout with provider**

Replace `app/[locale]/layout.tsx`:
```tsx
import "@/app/globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { display, heading, body } from "@/lib/fonts";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${heading.variable} ${body.variable}`}
    >
      <body className="bg-cones-black text-surface-50 font-body antialiased min-h-screen">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Use translation in homepage placeholder**

Replace `app/[locale]/page.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function Page({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("hero");
  return (
    <main className="p-8">
      <p className="font-heading text-cones-blue uppercase">{t("eyebrow")}</p>
      <h1 className="font-display text-6xl">
        <span className="text-cones-blue">{t("titleLine1")}</span>{" "}
        <span className="text-cones-orange">{t("titleLine2")}</span>
      </h1>
      <p className="mt-4 max-w-xl">{t("lead")}</p>
    </main>
  );
}
```

- [ ] **Step 12: Verify the routing test now passes**

Run: `pnpm test i18n/__tests__/routing.test.ts`
Expected: PASS.

- [ ] **Step 13: Verify manual smoke**

Run: `pnpm dev`.
Visit `/` — should render Serbian. Visit `/en` — should render English. Visit `/en/news` — 404 for now (expected). Stop server.

- [ ] **Step 14: Commit**

```bash
git add i18n messages middleware.ts next.config.ts app
git commit -m "feat: configure next-intl with sr default and en secondary"
```

---

### Task 6: Locale switcher component

**Files:**
- Create: `components/layout/LocaleSwitcher.tsx`, `components/layout/__tests__/LocaleSwitcher.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/layout/__tests__/LocaleSwitcher.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";

function wrap(ui: React.ReactNode, locale = "sr") {
  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      {ui}
    </NextIntlClientProvider>
  );
}

test("renders SR and EN toggle buttons", () => {
  render(wrap(<LocaleSwitcher />));
  expect(screen.getByRole("link", { name: /sr/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /en/i })).toBeInTheDocument();
});

test("marks the current locale as active", () => {
  render(wrap(<LocaleSwitcher />, "sr"));
  expect(screen.getByRole("link", { name: /sr/i })).toHaveAttribute(
    "aria-current",
    "true"
  );
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm test components/layout/__tests__/LocaleSwitcher.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement switcher**

Create `components/layout/LocaleSwitcher.tsx`:
```tsx
"use client";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export default function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = useLocale();

  return (
    <div className={cn("flex items-center gap-1 text-sm font-heading", className)}>
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-2 py-1 uppercase tracking-widest transition-colors",
              active ? "text-cones-blue" : "text-surface-200 hover:text-surface-50"
            )}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Ensure cn util exists**

Create `lib/utils/cn.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/layout/LocaleSwitcher.tsx components/layout/__tests__ lib/utils/cn.ts
git commit -m "feat: locale switcher preserving current pathname"
```

---

## Phase 3 — Core UI primitives

### Task 7: Button component

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/__tests__/Button.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `components/ui/__tests__/Button.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Button from "@/components/ui/Button";

test("renders with primary variant by default", () => {
  render(<Button>Play</Button>);
  const btn = screen.getByRole("button", { name: "Play" });
  expect(btn.className).toMatch(/bg-cones-blue/);
});

test("applies outline variant classes", () => {
  render(<Button variant="outline">Outline</Button>);
  const btn = screen.getByRole("button", { name: "Outline" });
  expect(btn.className).toMatch(/border/);
});

test("renders as anchor when href provided", () => {
  render(<Button href="/news">Go</Button>);
  expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/news");
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm test components/ui/__tests__/Button.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Button**

Create `components/ui/Button.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline";
type Size = "sm" | "md" | "lg";

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const base =
  "inline-flex items-center justify-center gap-2 font-heading font-semibold uppercase tracking-wider transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cones-blue focus-visible:ring-offset-2 focus-visible:ring-offset-cones-black disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-cones-blue text-cones-black hover:bg-cones-blue/90 shadow-cones-blue hover:-translate-y-0.5",
  secondary:
    "bg-cones-orange text-cones-black hover:bg-cones-orange/90 shadow-cones-orange hover:-translate-y-0.5",
  outline:
    "border border-surface-400 text-surface-50 hover:border-cones-blue hover:text-cones-blue",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: Props) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test components/ui/__tests__/Button.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx components/ui/__tests__/Button.test.tsx
git commit -m "feat: button primitive (primary/secondary/outline + size + href)"
```

---

### Task 8: Badge, Card, SectionHeading, StatBlock primitives

**Files:**
- Create: `components/ui/Badge.tsx`, `components/ui/Card.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/StatBlock.tsx`, `components/ui/__tests__/primitives.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `components/ui/__tests__/primitives.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBlock from "@/components/ui/StatBlock";

test("Badge renders with tone", () => {
  render(<Badge tone="blue">Live</Badge>);
  expect(screen.getByText("Live").className).toMatch(/text-cones-blue/);
});

test("Card renders children", () => {
  render(<Card>Body</Card>);
  expect(screen.getByText("Body")).toBeInTheDocument();
});

test("SectionHeading shows eyebrow + title", () => {
  render(<SectionHeading eyebrow="Tag" title="Title" />);
  expect(screen.getByText("Tag")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
});

test("StatBlock renders value and label", () => {
  render(<StatBlock value="12" label="Years" />);
  expect(screen.getByText("12")).toBeInTheDocument();
  expect(screen.getByText("Years")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests — expected fails**

Run: `pnpm test components/ui/__tests__/primitives.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Badge**

Create `components/ui/Badge.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "blue" | "orange" | "neutral";

const tones: Record<Tone, string> = {
  blue: "text-cones-blue border-cones-blue/40 bg-cones-blue/10",
  orange: "text-cones-orange border-cones-orange/40 bg-cones-orange/10",
  neutral: "text-surface-100 border-surface-400 bg-surface-700",
};

export default function Badge({
  tone = "blue",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs uppercase font-heading font-semibold tracking-widest",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Implement Card**

Create `components/ui/Card.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export default function Card({
  className,
  children,
  as: Tag = "article",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "group rounded-xl border border-surface-600 bg-surface-800/70 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-cones-blue/60 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 5: Implement SectionHeading**

Create `components/ui/SectionHeading.tsx`:
```tsx
import { cn } from "@/lib/utils/cn";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-cones-blue mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight text-surface-50">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-surface-200 text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </header>
  );
}
```

- [ ] **Step 6: Implement StatBlock**

Create `components/ui/StatBlock.tsx`:
```tsx
export default function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-5xl md:text-6xl leading-none text-cones-blue">
        {value}
      </span>
      <span className="mt-2 font-heading text-xs uppercase tracking-[0.25em] text-surface-200">
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 7: Run tests**

Run: `pnpm test components/ui/__tests__/primitives.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/ui
git commit -m "feat: badge, card, section-heading, stat-block primitives"
```

---

### Task 9: Input and form primitives

**Files:**
- Create: `components/ui/Input.tsx`, `components/ui/Select.tsx`, `components/ui/Textarea.tsx`, `components/ui/__tests__/form.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/ui/__tests__/form.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";

test("Input renders label, required marker and hint", () => {
  render(
    <Input label="Email" name="email" required hint="Required for RSVP" />
  );
  expect(screen.getByLabelText(/email/i)).toBeRequired();
  expect(screen.getByText("Required for RSVP")).toBeInTheDocument();
});

test("Textarea wires htmlFor correctly", () => {
  render(<Textarea label="Message" name="message" />);
  expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
});

test("Select renders options", () => {
  render(
    <Select label="Role" name="role">
      <option value="player">Player</option>
      <option value="fan">Fan</option>
    </Select>
  );
  expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Fan" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `pnpm test components/ui/__tests__/form.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Input**

Create `components/ui/Input.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;

export default function Input({
  label,
  name,
  hint,
  error,
  className,
  required,
  ...rest
}: Props) {
  const id = `in-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-heading text-xs uppercase tracking-[0.2em] text-surface-200"
      >
        {label}
        {required && <span className="text-cones-orange"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        className={cn(
          "h-11 rounded-md border border-surface-500 bg-surface-800 px-3 text-sm text-surface-50 placeholder:text-surface-300 focus-visible:outline-none focus-visible:border-cones-blue focus-visible:ring-2 focus-visible:ring-cones-blue/30",
          error && "border-red-500",
          className
        )}
        {...rest}
      />
      {hint && !error && (
        <p className="text-xs text-surface-300">{hint}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Implement Textarea**

Create `components/ui/Textarea.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;

export default function Textarea({
  label,
  name,
  hint,
  error,
  className,
  required,
  rows = 4,
  ...rest
}: Props) {
  const id = `ta-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-heading text-xs uppercase tracking-[0.2em] text-surface-200"
      >
        {label}
        {required && <span className="text-cones-orange"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        className={cn(
          "rounded-md border border-surface-500 bg-surface-800 p-3 text-sm text-surface-50 placeholder:text-surface-300 focus-visible:outline-none focus-visible:border-cones-blue focus-visible:ring-2 focus-visible:ring-cones-blue/30",
          error && "border-red-500",
          className
        )}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-surface-300">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Implement Select**

Create `components/ui/Select.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  name: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name" | "children">;

export default function Select({
  label,
  name,
  children,
  hint,
  error,
  className,
  required,
  ...rest
}: Props) {
  const id = `sel-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-heading text-xs uppercase tracking-[0.2em] text-surface-200"
      >
        {label}
        {required && <span className="text-cones-orange"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        className={cn(
          "h-11 rounded-md border border-surface-500 bg-surface-800 px-3 text-sm text-surface-50 focus-visible:outline-none focus-visible:border-cones-blue focus-visible:ring-2 focus-visible:ring-cones-blue/30",
          error && "border-red-500",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-surface-300">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Run tests**

Run: `pnpm test components/ui/__tests__/form.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ui/Input.tsx components/ui/Textarea.tsx components/ui/Select.tsx components/ui/__tests__/form.test.tsx
git commit -m "feat: input, textarea, select form primitives"
```

---

### Task 10: Nav and Footer

**Files:**
- Create: `components/layout/Nav.tsx`, `components/layout/Footer.tsx`, `components/layout/__tests__/Nav.test.tsx`
- Modify: `app/[locale]/layout.tsx`
- Add messages: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Extend message files with nav + footer keys**

Edit `messages/sr.json` — add:
```json
"footer": {
  "tagline": "Hokej. Tim. Beograd.",
  "quickLinks": "Brzi linkovi",
  "contact": "Kontakt",
  "follow": "Prati nas",
  "rights": "Sva prava zadržana.",
  "address": "Ledeni park Pionir, Čarli Čaplina 39, Beograd"
}
```

Edit `messages/en.json` — add:
```json
"footer": {
  "tagline": "Hockey. Team. Belgrade.",
  "quickLinks": "Quick links",
  "contact": "Contact",
  "follow": "Follow us",
  "rights": "All rights reserved.",
  "address": "Pionir Ice Park, Čarli Čaplina 39, Belgrade"
}
```

- [ ] **Step 2: Write failing Nav test**

Create `components/layout/__tests__/Nav.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Nav from "@/components/layout/Nav";
import sr from "@/messages/sr.json";

test("nav renders three links and locale switcher", () => {
  render(
    <NextIntlClientProvider locale="sr" messages={sr}>
      <Nav />
    </NextIntlClientProvider>
  );
  expect(screen.getByRole("link", { name: sr.nav.home })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: sr.nav.news })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: sr.nav.events })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /sr/i })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run — expected fail**

Run: `pnpm test components/layout/__tests__/Nav.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement Nav**

Create `components/layout/Nav.tsx`:
```tsx
"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/news", label: t("news") },
    { href: "/events", label: t("events") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 h-nav border-b border-surface-700/60 bg-cones-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-cones-blue text-cones-black font-display text-2xl">
            C
          </span>
          <span className="font-display text-2xl tracking-wide text-surface-50">
            CONES <span className="text-cones-orange">BELGRADE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-heading text-sm uppercase tracking-[0.25em] text-surface-100 hover:text-cones-blue transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <LocaleSwitcher />
          <Button href="/events" size="sm" variant="primary">
            {t("join")}
          </Button>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          className="md:hidden grid h-10 w-10 place-items-center rounded-md border border-surface-600 text-surface-100"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cn("block h-0.5 w-5 bg-current transition-all", open && "translate-y-1 rotate-45")} />
          <span className={cn("mt-1 block h-0.5 w-5 bg-current transition-all", open && "-translate-y-1 -rotate-45")} />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-surface-700/60 bg-cones-black px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-heading text-base uppercase tracking-widest text-surface-50"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-surface-700/60">
            <LocaleSwitcher />
            <Button href="/events" size="sm">{t("join")}</Button>
          </div>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 5: Implement Footer**

Create `components/layout/Footer.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const tNav = useTranslations("nav");
  const tF = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-surface-700/60 bg-surface-900">
      <div className="mx-auto max-w-container px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl text-surface-50">
            CONES <span className="text-cones-orange">BELGRADE</span>
          </p>
          <p className="mt-3 text-surface-200 text-sm leading-relaxed">
            {tF("tagline")}
          </p>
        </div>
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-cones-blue mb-3">
            {tF("quickLinks")}
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-cones-blue" href="/">{tNav("home")}</Link></li>
            <li><Link className="hover:text-cones-blue" href="/news">{tNav("news")}</Link></li>
            <li><Link className="hover:text-cones-blue" href="/events">{tNav("events")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-cones-blue mb-3">
            {tF("contact")}
          </p>
          <p className="text-sm text-surface-200">{tF("address")}</p>
          <p className="mt-2 text-sm text-surface-200">hello@cones.rs</p>
        </div>
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-cones-blue mb-3">
            {tF("follow")}
          </p>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-cones-blue" href="https://instagram.com/conesbelgrade" target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a className="hover:text-cones-blue" href="https://facebook.com/conesbelgrade" target="_blank" rel="noreferrer">Facebook</a></li>
            <li><a className="hover:text-cones-blue" href="https://youtube.com/@conesbelgrade" target="_blank" rel="noreferrer">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-700/60 py-4 text-center text-xs text-surface-300">
        © {year} Cones Belgrade. {tF("rights")}
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Mount Nav + Footer in locale layout**

Edit `app/[locale]/layout.tsx`'s body to wrap `{children}` between Nav and Footer:
```tsx
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
// ...inside body
<NextIntlClientProvider messages={messages} locale={locale}>
  <Nav />
  <main className="min-h-[calc(100dvh-72px)]">{children}</main>
  <Footer />
</NextIntlClientProvider>
```

- [ ] **Step 7: Run tests**

Run: `pnpm test`
Expected: PASS across all suites.

- [ ] **Step 8: Commit**

```bash
git add components/layout app/[locale]/layout.tsx messages
git commit -m "feat: sticky nav + footer with locale-aware links"
```

---

## Phase 4 — Sanity CMS

### Task 11: Sanity client and localized field schemas

**Files:**
- Create: `sanity/schemas/localeString.ts`, `sanity/schemas/localeText.ts`, `sanity/schemas/localeBlock.ts`, `sanity/schemas/index.ts`, `sanity.config.ts`, `lib/sanity/client.ts`, `lib/sanity/image.ts`, `lib/sanity/types.ts`, `.env.local.example`

- [ ] **Step 1: Install Sanity studio deps**

Run:
```bash
pnpm add sanity @sanity/vision styled-components
pnpm add -D @sanity/types
```
Expected: dependencies added.

- [ ] **Step 2: Add env template**

Create `.env.local.example`:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
SANITY_API_READ_TOKEN=
SITE_URL=https://conesbelgrade.rs
```

- [ ] **Step 3: Localized string schema**

Create `sanity/schemas/localeString.ts`:
```ts
import { defineType } from "sanity";

export const SUPPORTED_LOCALES = [
  { id: "sr", title: "Serbian" },
  { id: "en", title: "English" },
] as const;

export default defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: SUPPORTED_LOCALES.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: "string",
  })),
});
```

- [ ] **Step 4: Localized text schema**

Create `sanity/schemas/localeText.ts`:
```ts
import { defineType } from "sanity";
import { SUPPORTED_LOCALES } from "./localeString";

export default defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: SUPPORTED_LOCALES.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: "text",
    rows: 3,
  })),
});
```

- [ ] **Step 5: Localized rich-text (portable text) schema**

Create `sanity/schemas/localeBlock.ts`:
```ts
import { defineType } from "sanity";
import { SUPPORTED_LOCALES } from "./localeString";

export default defineType({
  name: "localeBlock",
  title: "Localized rich text",
  type: "object",
  fields: SUPPORTED_LOCALES.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type: "array",
    of: [
      { type: "block" },
      {
        type: "image",
        options: { hotspot: true },
      },
    ],
  })),
});
```

- [ ] **Step 6: Schema index**

Create `sanity/schemas/index.ts` (populated fully in later tasks — placeholder now):
```ts
import localeString from "./localeString";
import localeText from "./localeText";
import localeBlock from "./localeBlock";

export const schemaTypes = [localeString, localeText, localeBlock];
```

- [ ] **Step 7: Sanity config**

Create `sanity.config.ts`:
```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "cones-belgrade",
  title: "Cones Belgrade",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
```

- [ ] **Step 8: Sanity client**

Create `lib/sanity/client.ts`:
```ts
import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
```

- [ ] **Step 9: Image builder**

Create `lib/sanity/image.ts`:
```ts
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { projectId, dataset } from "./client";

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

- [ ] **Step 10: Locale-aware resolver type**

Create `lib/sanity/types.ts`:
```ts
import type { Locale } from "@/i18n/routing";

export type LocalizedString = Partial<Record<Locale, string>>;
export type LocalizedText = Partial<Record<Locale, string>>;

export function pickLocale<T extends LocalizedString | LocalizedText>(
  value: T | undefined,
  locale: Locale,
  fallback: Locale = "sr"
): string {
  if (!value) return "";
  return value[locale] ?? value[fallback] ?? "";
}
```

- [ ] **Step 11: Mount studio route**

Create `app/studio/[[...tool]]/page.tsx`:
```tsx
"use client";
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 12: Exclude studio from locale middleware**

Edit `middleware.ts` matcher so `/studio/*` is skipped:
```ts
export const config = {
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
```

- [ ] **Step 13: Verify build**

Run: `pnpm build`
Expected: completes without type errors (env vars can be empty — builder only uses them at runtime).

- [ ] **Step 14: Commit**

```bash
git add sanity sanity.config.ts lib/sanity app/studio middleware.ts .env.local.example package.json pnpm-lock.yaml
git commit -m "feat: sanity client, studio mount, and localized field types"
```

---

### Task 12: News, event, practice, sponsor, siteSettings schemas

**Files:**
- Create: `sanity/schemas/newsArticle.ts`, `sanity/schemas/event.ts`, `sanity/schemas/practiceSession.ts`, `sanity/schemas/sponsor.ts`, `sanity/schemas/siteSettings.ts`
- Modify: `sanity/schemas/index.ts`

- [ ] **Step 1: News article schema**

Create `sanity/schemas/newsArticle.ts`:
```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsArticle",
  title: "News Article",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: (doc) => (doc as { title?: { sr?: string } }).title?.sr || "" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Tournament", value: "tournament" },
          { title: "Club News", value: "club" },
          { title: "Roster", value: "roster" },
          { title: "Match Report", value: "match" },
          { title: "Community", value: "community" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "excerpt", title: "Excerpt", type: "localeText" }),
    defineField({ name: "body", title: "Body", type: "localeBlock" }),
    defineField({ name: "featured", title: "Featured on homepage", type: "boolean", initialValue: false }),
  ],
  orderings: [
    { title: "Newest", name: "newest", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title.sr", media: "coverImage", date: "publishedAt" },
    prepare({ title, media, date }) {
      return { title: title || "(untitled)", subtitle: date?.slice(0, 10), media };
    },
  },
});
```

- [ ] **Step 2: Event schema**

Create `sanity/schemas/event.ts`:
```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "startAt", title: "Start", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "endAt", title: "End", type: "datetime" }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Tournament", value: "tournament" },
          { title: "Match", value: "match" },
          { title: "Meetup", value: "meetup" },
          { title: "Camp", value: "camp" },
        ],
      },
    }),
    defineField({ name: "venue", title: "Venue", type: "localeString" }),
    defineField({ name: "city", title: "City", type: "string", initialValue: "Belgrade" }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "rsvpUrl", title: "RSVP URL", type: "url" }),
    defineField({ name: "isFeatured", title: "Featured", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "Soonest", name: "soonest", by: [{ field: "startAt", direction: "asc" }] }],
  preview: {
    select: { title: "title.sr", date: "startAt", media: "image" },
    prepare({ title, date, media }) {
      return { title: title || "(untitled)", subtitle: date?.slice(0, 16), media };
    },
  },
});
```

- [ ] **Step 3: Practice session schema**

Create `sanity/schemas/practiceSession.ts`:
```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "practiceSession",
  title: "Practice Session",
  type: "document",
  fields: [
    defineField({
      name: "dayOfWeek",
      title: "Day",
      type: "string",
      options: {
        list: [
          { title: "Monday", value: "mon" },
          { title: "Tuesday", value: "tue" },
          { title: "Wednesday", value: "wed" },
          { title: "Thursday", value: "thu" },
          { title: "Friday", value: "fri" },
          { title: "Saturday", value: "sat" },
          { title: "Sunday", value: "sun" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "startTime", title: "Start time (HH:MM)", type: "string", validation: (r) => r.regex(/^\d{2}:\d{2}$/).required() }),
    defineField({ name: "endTime", title: "End time (HH:MM)", type: "string", validation: (r) => r.regex(/^\d{2}:\d{2}$/).required() }),
    defineField({ name: "venue", title: "Venue", type: "localeString" }),
    defineField({ name: "level", title: "Level", type: "localeString" }),
    defineField({ name: "notes", title: "Notes", type: "localeText" }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "By order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { day: "dayOfWeek", t1: "startTime", venue: "venue.sr" },
    prepare({ day, t1, venue }) {
      return { title: `${day?.toUpperCase()} · ${t1}`, subtitle: venue };
    },
  },
});
```

- [ ] **Step 4: Sponsor schema**

Create `sanity/schemas/sponsor.ts`:
```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      options: { list: ["platinum", "gold", "silver", "partner"] },
      initialValue: "partner",
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "By order", name: "order", by: [{ field: "order", direction: "asc" }] }],
});
```

- [ ] **Step 5: Site settings singleton**

Create `sanity/schemas/siteSettings.ts`:
```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Site title", type: "localeString" }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({ name: "ogImage", title: "OG image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "stats",
      title: "Hero stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string" },
            { name: "label", type: "localeString" },
          ],
        },
      ],
      validation: (r) => r.max(3),
    }),
    defineField({ name: "galleryImages", title: "Gallery", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({ name: "teamPhoto", title: "Team photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "mascotImage", title: "Mascot image", type: "image", options: { hotspot: true } }),
  ],
});
```

- [ ] **Step 6: Register types**

Edit `sanity/schemas/index.ts`:
```ts
import localeString from "./localeString";
import localeText from "./localeText";
import localeBlock from "./localeBlock";
import newsArticle from "./newsArticle";
import event from "./event";
import practiceSession from "./practiceSession";
import sponsor from "./sponsor";
import siteSettings from "./siteSettings";

export const schemaTypes = [
  localeString,
  localeText,
  localeBlock,
  newsArticle,
  event,
  practiceSession,
  sponsor,
  siteSettings,
];
```

- [ ] **Step 7: Verify build**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add sanity/schemas
git commit -m "feat: sanity schemas for news, events, practice, sponsors, site settings"
```

---

### Task 13: GROQ queries + typed fetchers

**Files:**
- Create: `lib/sanity/queries.ts`, `lib/sanity/fetch.ts`, `lib/sanity/__tests__/pickLocale.test.ts`

- [ ] **Step 1: Write failing pickLocale test**

Create `lib/sanity/__tests__/pickLocale.test.ts`:
```ts
import { pickLocale } from "@/lib/sanity/types";

test("returns requested locale when present", () => {
  expect(pickLocale({ sr: "Вести", en: "News" }, "sr")).toBe("Вести");
});

test("falls back to sr when requested locale is missing", () => {
  expect(pickLocale({ sr: "Вести" }, "en")).toBe("Вести");
});

test("returns empty string when value undefined", () => {
  expect(pickLocale(undefined, "sr")).toBe("");
});
```

- [ ] **Step 2: Run — expected to PASS since types.ts already has pickLocale**

Run: `pnpm test lib/sanity/__tests__/pickLocale.test.ts`
Expected: PASS (Task 11 defined the function).

- [ ] **Step 3: Define GROQ queries**

Create `lib/sanity/queries.ts`:
```ts
import { groq } from "next-sanity";

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    title, description, ogImage, teamPhoto, mascotImage,
    "stats": stats[]{ value, label },
    "galleryImages": galleryImages[]
  }
`;

export const newsListQuery = groq`
  *[_type == "newsArticle"] | order(publishedAt desc){
    _id, title, "slug": slug.current, category, publishedAt, excerpt, coverImage, featured
  }
`;

export const featuredNewsQuery = groq`
  *[_type == "newsArticle"] | order(publishedAt desc)[0...3]{
    _id, title, "slug": slug.current, category, publishedAt, excerpt, coverImage
  }
`;

export const newsArticleBySlugQuery = groq`
  *[_type == "newsArticle" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, category, publishedAt, excerpt, body, coverImage
  }
`;

export const allNewsSlugsQuery = groq`*[_type == "newsArticle" && defined(slug.current)][].slug.current`;

export const upcomingEventsQuery = groq`
  *[_type == "event" && startAt >= now()] | order(startAt asc){
    _id, title, startAt, endAt, kind, venue, city, description, image, rsvpUrl, isFeatured
  }
`;

export const pastEventsQuery = groq`
  *[_type == "event" && startAt < now()] | order(startAt desc)[0...12]{
    _id, title, startAt, kind, venue, city, image
  }
`;

export const practiceScheduleQuery = groq`
  *[_type == "practiceSession"] | order(order asc){
    _id, dayOfWeek, startTime, endTime, venue, level, notes
  }
`;

export const sponsorsQuery = groq`
  *[_type == "sponsor"] | order(order asc){
    _id, name, logo, url, tier
  }
`;
```

- [ ] **Step 4: Typed fetch helper with ISR tags**

Create `lib/sanity/fetch.ts`:
```ts
import { sanityClient } from "./client";

type Params = Record<string, unknown>;

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 60,
}: {
  query: string;
  params?: Params;
  tags?: string[];
  revalidate?: number;
}): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    next: { revalidate, tags },
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/sanity
git commit -m "feat: groq queries and tagged fetch helper"
```

---

## Phase 5 — Homepage

### Task 14: Motion primitives (Reveal, Ticker)

**Files:**
- Create: `components/motion/Reveal.tsx`, `components/motion/Ticker.tsx`, `components/motion/__tests__/Reveal.test.tsx`

- [ ] **Step 1: Write failing test**

Create `components/motion/__tests__/Reveal.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import Reveal from "@/components/motion/Reveal";

test("Reveal renders children", () => {
  render(<Reveal>hello</Reveal>);
  expect(screen.getByText("hello")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run — expected fail**

Run: `pnpm test components/motion/__tests__/Reveal.test.tsx`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement Reveal**

Create `components/motion/Reveal.tsx`:
```tsx
"use client";
import { motion, type Variants } from "framer-motion";
import * as React from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: React.ElementType;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const MotionTag = motion(Tag);
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
```

- [ ] **Step 4: Implement Ticker**

Create `components/motion/Ticker.tsx`:
```tsx
"use client";
import { motion } from "framer-motion";
import * as React from "react";

export default function Ticker({
  children,
  duration = 40,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test components/motion`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/motion
git commit -m "feat: Reveal and Ticker framer-motion primitives"
```

---

### Task 15: Hero section

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/__tests__/Hero.test.tsx`
- Modify: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Extend messages**

Edit `messages/sr.json` — extend `hero`:
```json
"hero": {
  "eyebrow": "Najbolji hokejaški klub Beograda",
  "titleLine1": "CONES",
  "titleLine2": "BELGRADE",
  "lead": "Hokej na ledu u srcu Beograda. Strast, timski duh i fer-plej od 2014. godine.",
  "ctaPrimary": "Pridruži se timu",
  "ctaSecondary": "Saznaj više",
  "stats": {
    "yearsLabel": "Godina istorije",
    "membersLabel": "Članova",
    "matchesLabel": "Odigranih utakmica"
  }
}
```

Edit `messages/en.json` analogously:
```json
"hero": {
  "eyebrow": "Belgrade's finest hockey club",
  "titleLine1": "CONES",
  "titleLine2": "BELGRADE",
  "lead": "Ice hockey at the heart of Belgrade. Passion, teamwork, and fair play since 2014.",
  "ctaPrimary": "Join the team",
  "ctaSecondary": "Learn more",
  "stats": {
    "yearsLabel": "Years of history",
    "membersLabel": "Members",
    "matchesLabel": "Matches played"
  }
}
```

- [ ] **Step 2: Write failing test**

Create `components/home/__tests__/Hero.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Hero from "@/components/home/Hero";
import sr from "@/messages/sr.json";

test("renders split title and CTAs", () => {
  render(
    <NextIntlClientProvider locale="sr" messages={sr}>
      <Hero stats={[]} mascotUrl={null} />
    </NextIntlClientProvider>
  );
  expect(screen.getByText(sr.hero.titleLine1)).toBeInTheDocument();
  expect(screen.getByText(sr.hero.titleLine2)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: sr.hero.ctaPrimary })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run — expected fail**

Run: `pnpm test components/home/__tests__/Hero.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement Hero**

Create `components/home/Hero.tsx`:
```tsx
"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatBlock from "@/components/ui/StatBlock";
import Reveal from "@/components/motion/Reveal";

export type HeroStat = { value: string; label: string };

export default function Hero({
  stats,
  mascotUrl,
}: {
  stats: HeroStat[];
  mascotUrl: string | null;
}) {
  const t = useTranslations("hero");
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-80 bg-[radial-gradient(ellipse_at_top,rgba(0,173,241,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(247,148,28,0.18),transparent_60%),linear-gradient(180deg,#0A0C10_0%,#0A0C10_100%)]"
      />
      <div className="mx-auto max-w-container px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center">
        <Reveal className="space-y-8">
          <Badge tone="blue">
            <span className="h-1.5 w-1.5 rounded-full bg-cones-blue animate-pulse" />
            {t("eyebrow")}
          </Badge>
          <h1 className="font-display leading-[0.88] tracking-tight text-[14vw] md:text-[9rem]">
            <span className="block text-cones-blue">{t("titleLine1")}</span>
            <span className="block text-cones-orange">{t("titleLine2")}</span>
          </h1>
          <p className="max-w-xl text-lg text-surface-100 leading-relaxed">
            {t("lead")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/events" variant="primary" size="lg">{t("ctaPrimary")}</Button>
            <Button href="/news" variant="outline" size="lg">{t("ctaSecondary")}</Button>
          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-surface-700/60 max-w-xl">
              {stats.map((s) => (
                <StatBlock key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-square w-full max-w-md mx-auto">
          {mascotUrl ? (
            <Image src={mascotUrl} alt="Cones mascot" fill priority className="object-contain drop-shadow-[0_20px_60px_rgba(0,173,241,0.35)]" />
          ) : (
            <div className="h-full w-full rounded-full bg-gradient-to-br from-cones-blue/30 to-cones-orange/30 grid place-items-center font-display text-9xl text-cones-black">
              C
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests**

Run: `pnpm test components/home/__tests__/Hero.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/home/Hero.tsx components/home/__tests__/Hero.test.tsx messages
git commit -m "feat: homepage hero section with stats and mascot"
```

---

### Task 16: About, Gallery, NewsStrip, SponsorTicker, CtaBand sections

**Files:**
- Create: `components/home/About.tsx`, `components/home/Gallery.tsx`, `components/home/NewsStrip.tsx`, `components/home/SponsorTicker.tsx`, `components/home/CtaBand.tsx`
- Modify: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Extend messages for all sections**

Edit `messages/sr.json` — add:
```json
"about": {
  "eyebrow": "O klubu",
  "title": "Strast na ledu, zajednica van njega",
  "description": "Osnovan 2014. godine, Cones Belgrade je klub koji stoji iza svakog igrača, bilo da je veteran ili prvi put obuo klizaljke.",
  "pillars": {
    "passionTitle": "Strast", "passionText": "Svaki trening, svaka utakmica — bez kompromisa.",
    "unityTitle": "Tim", "unityText": "Igramo jedni za druge, pre svega ostalog.",
    "fairTitle": "Fer-plej", "fairText": "Poštujemo protivnika, sudije i igru.",
    "communityTitle": "Zajednica", "communityText": "Klub koji povezuje generacije hokejaša u Beogradu."
  }
},
"gallery": { "eyebrow": "Galerija", "title": "Trenuci sa leda" },
"news": { "eyebrow": "Najnovije", "title": "Vesti iz kluba", "cta": "Sve vesti" },
"sponsors": { "eyebrow": "Partneri", "title": "Oni veruju u nas" },
"cta": {
  "title": "Spreman za led?",
  "description": "Pridruži se treninzima — početnici su dobrodošli, a oprema se može iznajmiti.",
  "primary": "Zakaži probni trening",
  "secondary": "Pogledaj raspored"
}
```

Edit `messages/en.json` — add:
```json
"about": {
  "eyebrow": "About the club",
  "title": "Passion on the ice, community off it",
  "description": "Founded in 2014, Cones Belgrade is a club that stands behind every player — whether a veteran or lacing up skates for the first time.",
  "pillars": {
    "passionTitle": "Passion", "passionText": "Every practice, every game — no compromises.",
    "unityTitle": "Team", "unityText": "We play for each other, above all else.",
    "fairTitle": "Fair play", "fairText": "We respect opponents, referees, and the game.",
    "communityTitle": "Community", "communityText": "A club connecting generations of Belgrade hockey."
  }
},
"gallery": { "eyebrow": "Gallery", "title": "Moments from the ice" },
"news": { "eyebrow": "Latest", "title": "Club news", "cta": "All news" },
"sponsors": { "eyebrow": "Partners", "title": "They believe in us" },
"cta": {
  "title": "Ready for the ice?",
  "description": "Join our practices — beginners welcome, gear can be rented on site.",
  "primary": "Book a trial practice",
  "secondary": "See schedule"
}
```

- [ ] **Step 2: About section**

Create `components/home/About.tsx`:
```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function About({ teamPhotoUrl }: { teamPhotoUrl: string | null }) {
  const t = useTranslations("about");
  const pillars = [
    { title: t("pillars.passionTitle"), text: t("pillars.passionText") },
    { title: t("pillars.unityTitle"), text: t("pillars.unityText") },
    { title: t("pillars.fairTitle"), text: t("pillars.fairText") },
    { title: t("pillars.communityTitle"), text: t("pillars.communityText") },
  ];

  return (
    <section id="about" className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6 grid gap-12 md:grid-cols-2 items-center">
        <Reveal className="relative aspect-[4/5] rounded-xl overflow-hidden border border-surface-700">
          {teamPhotoUrl ? (
            <Image src={teamPhotoUrl} alt="Team photo" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-700" />
          )}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
            <span className="font-display text-6xl text-cones-orange">10+</span>
            <span className="font-heading uppercase tracking-widest text-xs text-surface-100">
              {t("eyebrow")}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="space-y-8">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <ul className="grid grid-cols-2 gap-6">
            {pillars.map((p) => (
              <li key={p.title} className="rounded-lg border border-surface-700 bg-surface-800/50 p-5">
                <p className="font-heading text-sm uppercase tracking-[0.2em] text-cones-blue">
                  {p.title}
                </p>
                <p className="mt-2 text-sm text-surface-100 leading-relaxed">{p.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Gallery section**

Create `components/home/Gallery.tsx`:
```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function Gallery({ images }: { images: string[] }) {
  const t = useTranslations("gallery");
  const slots = images.length ? images : Array(5).fill(null);
  const layoutClasses = [
    "md:col-span-6 md:row-span-2 aspect-square md:aspect-auto",
    "md:col-span-6 aspect-[4/3]",
    "md:col-span-3 aspect-square",
    "md:col-span-3 aspect-square",
    "md:col-span-6 aspect-[16/9]",
  ];

  return (
    <section className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {slots.slice(0, 5).map((url, i) => (
            <Reveal
              key={i}
              delay={i * 0.05}
              className={`relative overflow-hidden rounded-lg border border-surface-700 group ${layoutClasses[i]}`}
            >
              {url ? (
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: NewsStrip**

Create `components/home/NewsStrip.tsx`:
```tsx
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/motion/Reveal";
import { pickLocale } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/utils/formatDate";

export type HomeNewsCard = {
  _id: string;
  slug: string;
  title: { sr?: string; en?: string };
  excerpt?: { sr?: string; en?: string };
  category: string;
  publishedAt: string;
  coverImageUrl: string | null;
};

export default function NewsStrip({ articles }: { articles: HomeNewsCard[] }) {
  const t = useTranslations("news");
  const locale = useLocale() as Locale;
  if (!articles.length) return null;

  return (
    <section id="news" className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
          <Link
            href="/news"
            className="hidden md:inline font-heading text-xs uppercase tracking-[0.25em] text-cones-blue hover:text-cones-orange"
          >
            {t("cta")} →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <Reveal key={a._id} delay={i * 0.08}>
              <Card>
                <Link href={{ pathname: "/news/[slug]", params: { slug: a.slug } }}>
                  <div className="relative aspect-[16/10]">
                    {a.coverImageUrl ? (
                      <Image
                        src={a.coverImageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge tone="orange">{a.category}</Badge>
                      <span className="text-xs text-surface-300">
                        {formatDate(a.publishedAt, locale)}
                      </span>
                    </div>
                    <h3 className="font-heading text-2xl leading-tight text-surface-50 group-hover:text-cones-blue">
                      {pickLocale(a.title, locale)}
                    </h3>
                    {a.excerpt && (
                      <p className="text-sm text-surface-200 line-clamp-3">
                        {pickLocale(a.excerpt, locale)}
                      </p>
                    )}
                  </div>
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Add formatDate utility**

Create `lib/utils/formatDate.ts`:
```ts
import type { Locale } from "@/i18n/routing";

const LOCALE_MAP: Record<Locale, string> = { sr: "sr-Latn-RS", en: "en-GB" };

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
```

- [ ] **Step 6: SponsorTicker**

Create `components/home/SponsorTicker.tsx`:
```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Ticker from "@/components/motion/Ticker";

export type SponsorItem = { _id: string; name: string; url?: string; logoUrl: string | null };

export default function SponsorTicker({ sponsors }: { sponsors: SponsorItem[] }) {
  const t = useTranslations("sponsors");
  if (!sponsors.length) return null;

  return (
    <section className="py-20 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6 mb-10">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" className="mx-auto" />
      </div>
      <Ticker duration={45} className="mask-fade-x">
        {sponsors.map((s) => (
          <a
            key={s._id}
            href={s.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 px-8 py-4 border-x border-surface-700/60"
          >
            {s.logoUrl ? (
              <Image src={s.logoUrl} alt={s.name} width={120} height={60} className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
            ) : (
              <span className="font-display text-3xl text-surface-100">{s.name}</span>
            )}
          </a>
        ))}
      </Ticker>
    </section>
  );
}
```

Append to `app/globals.css`:
```css
.mask-fade-x {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

- [ ] **Step 7: CTA band**

Create `components/home/CtaBand.tsx`:
```tsx
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

export default function CtaBand() {
  const t = useTranslations("cta");
  return (
    <section className="py-20 border-t border-surface-700/60 bg-[linear-gradient(135deg,rgba(0,173,241,0.15),rgba(247,148,28,0.12))]">
      <Reveal className="mx-auto max-w-container px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-5xl md:text-6xl text-surface-50">{t("title")}</h2>
          <p className="mt-3 text-surface-100 max-w-xl">{t("description")}</p>
        </div>
        <div className="flex gap-3">
          <Button href="/events" variant="primary" size="lg">{t("primary")}</Button>
          <Button href="/events" variant="outline" size="lg">{t("secondary")}</Button>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add components/home messages app/globals.css lib/utils/formatDate.ts
git commit -m "feat: about, gallery, news strip, sponsor ticker, cta band sections"
```

---

### Task 17: Assemble homepage

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Replace homepage with full composition**

Replace `app/[locale]/page.tsx`:
```tsx
import { setRequestLocale } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { siteSettingsQuery, featuredNewsQuery, sponsorsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import Hero, { type HeroStat } from "@/components/home/Hero";
import About from "@/components/home/About";
import Gallery from "@/components/home/Gallery";
import NewsStrip, { type HomeNewsCard } from "@/components/home/NewsStrip";
import SponsorTicker, { type SponsorItem } from "@/components/home/SponsorTicker";
import CtaBand from "@/components/home/CtaBand";

type SanityImageRef = { asset?: { _ref: string } } | null | undefined;

type Settings = {
  stats?: Array<{ value: string; label: { sr?: string; en?: string } }>;
  teamPhoto?: SanityImageRef;
  mascotImage?: SanityImageRef;
  galleryImages?: Array<SanityImageRef>;
};

type NewsDoc = {
  _id: string;
  slug: string;
  title: { sr?: string; en?: string };
  excerpt?: { sr?: string; en?: string };
  category: string;
  publishedAt: string;
  coverImage?: SanityImageRef;
};

type SponsorDoc = {
  _id: string;
  name: string;
  url?: string;
  logo?: SanityImageRef;
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, news, sponsors] = await Promise.all([
    sanityFetch<Settings | null>({ query: siteSettingsQuery, tags: ["siteSettings"] }),
    sanityFetch<NewsDoc[]>({ query: featuredNewsQuery, tags: ["news"] }),
    sanityFetch<SponsorDoc[]>({ query: sponsorsQuery, tags: ["sponsor"] }),
  ]);

  const stats: HeroStat[] = (settings?.stats ?? []).map((s) => ({
    value: s.value,
    label: pickLocale(s.label, locale),
  }));

  const mascotUrl = settings?.mascotImage
    ? urlFor(settings.mascotImage).width(700).height(700).fit("max").url()
    : null;
  const teamPhotoUrl = settings?.teamPhoto
    ? urlFor(settings.teamPhoto).width(900).height(1125).fit("crop").url()
    : null;
  const galleryUrls: string[] = (settings?.galleryImages ?? [])
    .filter((img): img is NonNullable<typeof img> => Boolean(img))
    .map((img) => urlFor(img).width(1200).height(800).fit("crop").url());

  const newsCards: HomeNewsCard[] = news.map((n) => ({
    _id: n._id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    category: n.category,
    publishedAt: n.publishedAt,
    coverImageUrl: n.coverImage
      ? urlFor(n.coverImage).width(800).height(500).fit("crop").url()
      : null,
  }));

  const sponsorItems: SponsorItem[] = sponsors.map((s) => ({
    _id: s._id,
    name: s.name,
    url: s.url,
    logoUrl: s.logo ? urlFor(s.logo).width(240).height(120).fit("max").url() : null,
  }));

  return (
    <>
      <Hero stats={stats} mascotUrl={mascotUrl} />
      <About teamPhotoUrl={teamPhotoUrl} />
      <Gallery images={galleryUrls} />
      <NewsStrip articles={newsCards} />
      <SponsorTicker sponsors={sponsorItems} />
      <CtaBand />
    </>
  );
}
```

- [ ] **Step 2: Smoke-run build**

Run: `pnpm build`
Expected: PASS even with no Sanity project (queries return null / empty arrays during static generation once env vars are set; unit tests cover rendering with empty arrays).

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat: compose homepage from sanity-driven sections"
```

---

## Phase 6 — News pages

### Task 18: News listing page

**Files:**
- Create: `app/[locale]/news/page.tsx`, `components/news/ArticleCard.tsx`, `components/news/CategoryFilter.tsx`
- Modify: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Extend messages**

Edit `messages/sr.json` — add:
```json
"newsPage": {
  "eyebrow": "Vesti",
  "title": "Najnovije iz Cones Belgrade",
  "description": "Utakmice, turniri, novi dresovi i priče iz kluba.",
  "filters": {
    "all": "Sve",
    "tournament": "Turniri",
    "club": "Klub",
    "roster": "Ekipa",
    "match": "Utakmice",
    "community": "Zajednica"
  },
  "empty": "Trenutno nema vesti. Vratite se uskoro."
}
```

Edit `messages/en.json`:
```json
"newsPage": {
  "eyebrow": "News",
  "title": "Latest from Cones Belgrade",
  "description": "Matches, tournaments, new jerseys, and stories from the club.",
  "filters": {
    "all": "All",
    "tournament": "Tournaments",
    "club": "Club",
    "roster": "Roster",
    "match": "Matches",
    "community": "Community"
  },
  "empty": "No news yet. Check back soon."
}
```

- [ ] **Step 2: ArticleCard**

Create `components/news/ArticleCard.tsx`:
```tsx
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { pickLocale } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/formatDate";
import type { Locale } from "@/i18n/routing";

export type ArticleCardData = {
  _id: string;
  slug: string;
  title: { sr?: string; en?: string };
  excerpt?: { sr?: string; en?: string };
  category: string;
  publishedAt: string;
  coverImageUrl: string | null;
};

export default function ArticleCard({
  article,
  locale,
  size = "md",
}: {
  article: ArticleCardData;
  locale: Locale;
  size?: "sm" | "md" | "lg";
}) {
  const aspect = size === "lg" ? "aspect-[21/9]" : size === "sm" ? "aspect-[16/10]" : "aspect-[16/10]";
  const titleClass =
    size === "lg"
      ? "text-3xl md:text-4xl"
      : size === "sm"
      ? "text-lg"
      : "text-2xl";

  return (
    <Card>
      <Link
        href={{ pathname: "/news/[slug]", params: { slug: article.slug } }}
        className="flex flex-col h-full"
      >
        <div className={`relative ${aspect}`}>
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
          )}
        </div>
        <div className="p-6 space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Badge tone="orange">{article.category}</Badge>
            <span className="text-xs text-surface-300">
              {formatDate(article.publishedAt, locale)}
            </span>
          </div>
          <h3 className={`font-heading ${titleClass} leading-tight text-surface-50 group-hover:text-cones-blue transition-colors`}>
            {pickLocale(article.title, locale)}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-surface-200 line-clamp-3">
              {pickLocale(article.excerpt, locale)}
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
```

- [ ] **Step 3: CategoryFilter (client)**

Create `components/news/CategoryFilter.tsx`:
```tsx
"use client";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const CATEGORIES = ["all", "tournament", "club", "roster", "match", "community"] as const;
type Category = (typeof CATEGORIES)[number];

export default function CategoryFilter({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  const t = useTranslations("newsPage.filters");
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "rounded-pill px-4 py-2 text-xs font-heading uppercase tracking-widest border transition-colors",
            active === c
              ? "bg-cones-blue text-cones-black border-cones-blue"
              : "border-surface-600 text-surface-100 hover:border-cones-blue hover:text-cones-blue"
          )}
        >
          {t(c)}
        </button>
      ))}
    </div>
  );
}

export type { Category };
export { CATEGORIES };
```

- [ ] **Step 4: News listing page**

Create `app/[locale]/news/page.tsx`:
```tsx
"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import ArticleCard, { type ArticleCardData } from "@/components/news/ArticleCard";
import CategoryFilter, { type Category } from "@/components/news/CategoryFilter";
import SectionHeading from "@/components/ui/SectionHeading";

export default function NewsPageClient({ articles }: { articles: ArticleCardData[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("newsPage");
  const [category, setCategory] = useState<Category>("all");

  const filtered = useMemo(
    () => (category === "all" ? articles : articles.filter((a) => a.category === category)),
    [articles, category]
  );

  return (
    <div className="mx-auto max-w-container px-6 py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="mt-10 mb-10">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>
      {filtered.length === 0 ? (
        <p className="text-surface-200 py-20 text-center">{t("empty")}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a._id} article={a} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
```

Now the page shell wrapping it — rename the file above to `components/news/NewsPageClient.tsx`, then create the server page:

Run: `mv app/[locale]/news/page.tsx components/news/NewsPageClient.tsx`

Create `app/[locale]/news/page.tsx`:
```tsx
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { sanityFetch } from "@/lib/sanity/fetch";
import { newsListQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import NewsPageClient from "@/components/news/NewsPageClient";
import type { ArticleCardData } from "@/components/news/ArticleCard";

type Doc = {
  _id: string;
  slug: string;
  title: { sr?: string; en?: string };
  excerpt?: { sr?: string; en?: string };
  category: string;
  publishedAt: string;
  coverImage?: { asset?: { _ref: string } };
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const docs = await sanityFetch<Doc[]>({ query: newsListQuery, tags: ["news"] });
  const articles: ArticleCardData[] = docs.map((d) => ({
    _id: d._id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    category: d.category,
    publishedAt: d.publishedAt,
    coverImageUrl: d.coverImage ? urlFor(d.coverImage).width(800).height(500).fit("crop").url() : null,
  }));
  return <NewsPageClient articles={articles} />;
}
```

- [ ] **Step 5: Run tests and build**

Run: `pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/news components/news messages
git commit -m "feat: news listing with client-side category filter"
```

---

### Task 19: News article detail page

**Files:**
- Create: `app/[locale]/news/[slug]/page.tsx`, `components/news/ArticleBody.tsx`, `components/news/PortableBody.tsx`
- Modify: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Install portable text renderer**

Run: `pnpm add @portabletext/react`
Expected: dependency added.

- [ ] **Step 2: Extend messages**

Edit `messages/sr.json` — add:
```json
"article": {
  "back": "Sve vesti",
  "share": "Podeli",
  "notFound": "Članak nije pronađen"
}
```

Edit `messages/en.json`:
```json
"article": {
  "back": "All news",
  "share": "Share",
  "notFound": "Article not found"
}
```

- [ ] **Step 3: Portable body renderer**

Create `components/news/PortableBody.tsx`:
```tsx
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

type Block = Parameters<typeof PortableText>[0]["value"];

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure className="my-8 overflow-hidden rounded-lg border border-surface-700">
        <Image
          src={urlFor(value).width(1400).fit("max").url()}
          alt={value.alt ?? ""}
          width={1400}
          height={900}
          className="w-full h-auto"
        />
      </figure>
    ),
  },
  block: {
    normal: ({ children }) => <p className="text-surface-100 leading-relaxed text-lg my-4">{children}</p>,
    h2: ({ children }) => <h2 className="font-heading text-3xl md:text-4xl text-surface-50 mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="font-heading text-2xl text-surface-50 mt-8 mb-3">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-cones-orange pl-6 my-8 italic text-surface-100">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} className="text-cones-blue hover:text-cones-orange underline underline-offset-4">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="text-surface-50 font-semibold">{children}</strong>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 my-4 text-surface-100 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 my-4 text-surface-100 space-y-2">{children}</ol>,
  },
};

export default function PortableBody({ value }: { value: Block }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
```

- [ ] **Step 4: Article detail page**

Create `app/[locale]/news/[slug]/page.tsx`:
```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  newsArticleBySlugQuery,
  allNewsSlugsQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/formatDate";
import Badge from "@/components/ui/Badge";
import PortableBody from "@/components/news/PortableBody";
import { articleMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

type Doc = {
  _id: string;
  title: { sr?: string; en?: string };
  slug: string;
  category: string;
  publishedAt: string;
  excerpt?: { sr?: string; en?: string };
  body?: { sr?: unknown[]; en?: unknown[] };
  coverImage?: { asset?: { _ref: string } };
};

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({ query: allNewsSlugsQuery, tags: ["news"] });
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = await sanityFetch<Doc | null>({
    query: newsArticleBySlugQuery,
    params: { slug },
    tags: [`news:${slug}`, "news"],
  });
  if (!doc) return {};
  const title = pickLocale(doc.title, locale);
  const description = pickLocale(doc.excerpt, locale);
  const image = doc.coverImage
    ? urlFor(doc.coverImage).width(1200).height(630).fit("crop").url()
    : undefined;
  return articleMetadata({ locale, slug, title, description, image, publishedAt: doc.publishedAt });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("article");
  const doc = await sanityFetch<Doc | null>({
    query: newsArticleBySlugQuery,
    params: { slug },
    tags: [`news:${slug}`, "news"],
  });
  if (!doc) notFound();

  const title = pickLocale(doc.title, locale);
  const excerpt = pickLocale(doc.excerpt, locale);
  const body = doc.body?.[locale] ?? doc.body?.sr ?? [];
  const coverUrl = doc.coverImage
    ? urlFor(doc.coverImage).width(1800).fit("max").url()
    : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-[0.25em] text-cones-blue hover:text-cones-orange"
      >
        ← {t("back")}
      </Link>
      <header className="mt-8 space-y-4">
        <div className="flex items-center gap-3">
          <Badge tone="orange">{doc.category}</Badge>
          <span className="text-xs text-surface-300">{formatDate(doc.publishedAt, locale)}</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl text-surface-50 leading-[0.95]">
          {title}
        </h1>
        {excerpt && <p className="text-xl text-surface-200">{excerpt}</p>}
      </header>
      {coverUrl && (
        <figure className="mt-10 overflow-hidden rounded-xl border border-surface-700">
          <Image
            src={coverUrl}
            alt=""
            width={1800}
            height={1000}
            className="w-full h-auto"
            priority
          />
        </figure>
      )}
      <div className="mt-12 prose-cones">
        <PortableBody value={body as Parameters<typeof PortableBody>[0]["value"]} />
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/news components/news messages package.json pnpm-lock.yaml
git commit -m "feat: news article detail with portable text body"
```

---

## Phase 7 — Events page

### Task 20: Events tabs, event card, practice table

**Files:**
- Create: `components/events/EventsTabs.tsx`, `components/events/EventCard.tsx`, `components/events/PracticeTable.tsx`
- Modify: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Extend messages**

Edit `messages/sr.json` — add:
```json
"events": {
  "eyebrow": "Događaji",
  "title": "Kalendar kluba",
  "description": "Turniri, prijateljske utakmice, otvoreni treninzi i okupljanja.",
  "tabs": { "upcoming": "Predstojeći", "schedule": "Raspored treninga", "past": "Prošli" },
  "empty": "Nema događaja za prikaz.",
  "rsvp": "Prijavi se",
  "today": "Danas",
  "days": {
    "mon": "Ponedeljak", "tue": "Utorak", "wed": "Sreda", "thu": "Četvrtak",
    "fri": "Petak", "sat": "Subota", "sun": "Nedelja"
  },
  "table": { "day": "Dan", "time": "Termin", "venue": "Lokacija", "level": "Nivo", "notes": "Napomene" },
  "fees": {
    "title": "Naknade za treninge",
    "members": "Članovi — besplatno",
    "guests": "Gosti — 800 RSD po terminu",
    "monthly": "Mesečna karta — 3000 RSD"
  }
},
"rsvpForm": {
  "title": "Rezerviši mesto",
  "description": "Popuni formu i javićemo ti se sa detaljima treninga ili događaja.",
  "name": "Ime i prezime",
  "email": "Email",
  "phone": "Telefon",
  "role": "Ja sam",
  "roles": { "player": "Igrač", "beginner": "Početnik", "fan": "Navijač", "parent": "Roditelj" },
  "message": "Poruka",
  "submit": "Pošalji prijavu",
  "success": "Hvala! Javićemo se uskoro.",
  "error": "Nešto je pošlo po zlu. Pokušajte ponovo."
}
```

Edit `messages/en.json` analogously:
```json
"events": {
  "eyebrow": "Events",
  "title": "Club calendar",
  "description": "Tournaments, friendly matches, open practices, and meetups.",
  "tabs": { "upcoming": "Upcoming", "schedule": "Practice schedule", "past": "Past" },
  "empty": "No events to display.",
  "rsvp": "RSVP",
  "today": "Today",
  "days": {
    "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday", "thu": "Thursday",
    "fri": "Friday", "sat": "Saturday", "sun": "Sunday"
  },
  "table": { "day": "Day", "time": "Time", "venue": "Venue", "level": "Level", "notes": "Notes" },
  "fees": {
    "title": "Practice fees",
    "members": "Members — free",
    "guests": "Guests — 800 RSD per session",
    "monthly": "Monthly pass — 3000 RSD"
  }
},
"rsvpForm": {
  "title": "Reserve your spot",
  "description": "Fill in the form and we'll reply with practice or event details.",
  "name": "Full name",
  "email": "Email",
  "phone": "Phone",
  "role": "I am",
  "roles": { "player": "Player", "beginner": "Beginner", "fan": "Fan", "parent": "Parent" },
  "message": "Message",
  "submit": "Send request",
  "success": "Thanks! We'll be in touch soon.",
  "error": "Something went wrong. Please try again."
}
```

- [ ] **Step 2: EventCard**

Create `components/events/EventCard.tsx`:
```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { pickLocale } from "@/lib/sanity/types";
import { formatTime } from "@/lib/utils/formatDate";
import type { Locale } from "@/i18n/routing";

export type EventItem = {
  _id: string;
  title: { sr?: string; en?: string };
  startAt: string;
  endAt?: string;
  kind?: string;
  venue?: { sr?: string; en?: string };
  city?: string;
  description?: { sr?: string; en?: string };
  imageUrl: string | null;
  rsvpUrl?: string;
};

export default function EventCard({
  item,
  locale,
  showRsvp = true,
}: {
  item: EventItem;
  locale: Locale;
  showRsvp?: boolean;
}) {
  const t = useTranslations("events");
  const d = new Date(item.startAt);

  return (
    <Card className="flex flex-col md:flex-row">
      <div className="relative md:w-64 md:shrink-0 aspect-[4/3] md:aspect-auto">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 256px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
        )}
        <div className="absolute top-3 left-3 rounded-md bg-cones-black/80 backdrop-blur px-3 py-2 text-center">
          <p className="font-display text-3xl leading-none text-cones-orange">
            {d.getDate().toString().padStart(2, "0")}
          </p>
          <p className="font-heading text-[10px] uppercase tracking-widest text-surface-100">
            {new Intl.DateTimeFormat(locale === "sr" ? "sr-Latn-RS" : "en-GB", { month: "short" }).format(d)}
          </p>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            {item.kind && <Badge tone="blue">{item.kind}</Badge>}
            <span className="text-xs text-surface-300">
              {formatTime(item.startAt, locale)}
              {item.endAt ? ` – ${formatTime(item.endAt, locale)}` : ""}
            </span>
          </div>
          <h3 className="mt-2 font-heading text-2xl text-surface-50">
            {pickLocale(item.title, locale)}
          </h3>
          {item.venue && (
            <p className="text-sm text-surface-200">
              {pickLocale(item.venue, locale)}
              {item.city ? `, ${item.city}` : ""}
            </p>
          )}
          {item.description && (
            <p className="mt-3 text-sm text-surface-200">
              {pickLocale(item.description, locale)}
            </p>
          )}
        </div>
        {showRsvp && item.rsvpUrl && (
          <div>
            <Button href={item.rsvpUrl} variant="primary" size="sm">
              {t("rsvp")}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: PracticeTable**

Create `components/events/PracticeTable.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { pickLocale } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";

export type PracticeRow = {
  _id: string;
  dayOfWeek: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  startTime: string;
  endTime: string;
  venue?: { sr?: string; en?: string };
  level?: { sr?: string; en?: string };
  notes?: { sr?: string; en?: string };
};

const JS_DAY_TO_KEY: Record<number, PracticeRow["dayOfWeek"]> = {
  0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
};

export default function PracticeTable({
  rows,
  locale,
}: {
  rows: PracticeRow[];
  locale: Locale;
}) {
  const t = useTranslations("events");
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-700">
      <table className="min-w-full divide-y divide-surface-700">
        <thead className="bg-surface-800">
          <tr>
            {(["day", "time", "venue", "level", "notes"] as const).map((k) => (
              <th
                key={k}
                className="px-4 py-3 text-left font-heading text-xs uppercase tracking-[0.2em] text-cones-blue"
              >
                {t(`table.${k}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-700/60">
          {rows.map((r) => {
            const isToday = r.dayOfWeek === todayKey;
            return (
              <tr key={r._id} className={isToday ? "bg-cones-blue/10" : ""}>
                <td className="px-4 py-4 font-heading uppercase tracking-widest text-sm">
                  {t(`days.${r.dayOfWeek}`)}
                  {isToday && (
                    <span className="ml-2 rounded-pill bg-cones-blue text-cones-black px-2 py-0.5 text-[10px] uppercase tracking-widest">
                      {t("today")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 font-body text-surface-50">
                  {r.startTime} – {r.endTime}
                </td>
                <td className="px-4 py-4 text-surface-100">{pickLocale(r.venue, locale)}</td>
                <td className="px-4 py-4 text-surface-100">{pickLocale(r.level, locale)}</td>
                <td className="px-4 py-4 text-surface-200 text-sm">{pickLocale(r.notes, locale)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: EventsTabs (client)**

Create `components/events/EventsTabs.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";
import EventCard, { type EventItem } from "./EventCard";
import PracticeTable, { type PracticeRow } from "./PracticeTable";

type Tab = "upcoming" | "schedule" | "past";

export default function EventsTabs({
  upcoming,
  past,
  schedule,
}: {
  upcoming: EventItem[];
  past: EventItem[];
  schedule: PracticeRow[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("events");
  const [tab, setTab] = useState<Tab>("upcoming");
  const tabs: Tab[] = ["upcoming", "schedule", "past"];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10 border-b border-surface-700/60">
        {tabs.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "px-5 py-3 font-heading uppercase tracking-[0.2em] text-xs border-b-2 -mb-px transition-colors",
              tab === k
                ? "border-cones-blue text-cones-blue"
                : "border-transparent text-surface-200 hover:text-surface-50"
            )}
          >
            {t(`tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <div className="grid gap-6">
          {upcoming.length === 0 ? (
            <p className="text-surface-200 py-12 text-center">{t("empty")}</p>
          ) : (
            upcoming.map((e) => <EventCard key={e._id} item={e} locale={locale} />)
          )}
        </div>
      )}

      {tab === "schedule" && (
        <div className="space-y-8">
          <PracticeTable rows={schedule} locale={locale} />
          <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-6">
            <p className="font-heading text-sm uppercase tracking-[0.25em] text-cones-orange mb-3">
              {t("fees.title")}
            </p>
            <ul className="grid gap-2 text-surface-100 text-sm md:grid-cols-3">
              <li>{t("fees.members")}</li>
              <li>{t("fees.guests")}</li>
              <li>{t("fees.monthly")}</li>
            </ul>
          </div>
        </div>
      )}

      {tab === "past" && (
        <div className="grid gap-6 md:grid-cols-2">
          {past.length === 0 ? (
            <p className="text-surface-200 py-12 text-center md:col-span-2">{t("empty")}</p>
          ) : (
            past.map((e) => <EventCard key={e._id} item={e} locale={locale} showRsvp={false} />)
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/events messages
git commit -m "feat: events tabs, event card, practice table components"
```

---

### Task 21: RSVP form + API route

**Files:**
- Create: `components/events/RsvpForm.tsx`, `app/api/rsvp/route.ts`, `lib/validation/rsvp.ts`

- [ ] **Step 1: RSVP zod schema**

Create `lib/validation/rsvp.ts`:
```ts
import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(4).max(40).optional().or(z.literal("")),
  role: z.enum(["player", "beginner", "fan", "parent"]),
  message: z.string().max(1000).optional().or(z.literal("")),
  locale: z.enum(["sr", "en"]),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
```

- [ ] **Step 2: API route**

Create `app/api/rsvp/route.ts`:
```ts
import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/validation/rsvp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = rsvpSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const endpoint = process.env.RSVP_WEBHOOK_URL;
  if (endpoint) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }).catch(() => null);
  } else {
    console.log("[RSVP]", parsed.data);
  }

  return NextResponse.json({ ok: true });
}
```

Add `RSVP_WEBHOOK_URL=` to `.env.local.example`.

- [ ] **Step 3: Client form**

Create `components/events/RsvpForm.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { rsvpSchema } from "@/lib/validation/rsvp";

type Status = "idle" | "sending" | "success" | "error";

export default function RsvpForm() {
  const t = useTranslations("rsvpForm");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      role: String(fd.get("role") ?? "player"),
      message: String(fd.get("message") ?? ""),
      locale,
    };
    const parsed = rsvpSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(
        Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])
        )
      );
      setStatus("error");
      return;
    }
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setStatus(res.ok ? "success" : "error");
    if (res.ok) (e.target as HTMLFormElement).reset();
  }

  return (
    <section className="mt-20 rounded-xl border border-surface-700 bg-surface-800/60 p-8 md:p-12">
      <header className="max-w-xl">
        <h2 className="font-display text-4xl md:text-5xl text-surface-50">{t("title")}</h2>
        <p className="mt-2 text-surface-200">{t("description")}</p>
      </header>
      <form onSubmit={onSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
        <Input label={t("name")} name="name" required error={fieldErrors.name} />
        <Input label={t("email")} name="email" type="email" required error={fieldErrors.email} />
        <Input label={t("phone")} name="phone" type="tel" error={fieldErrors.phone} />
        <Select label={t("role")} name="role" required error={fieldErrors.role} defaultValue="player">
          <option value="player">{t("roles.player")}</option>
          <option value="beginner">{t("roles.beginner")}</option>
          <option value="fan">{t("roles.fan")}</option>
          <option value="parent">{t("roles.parent")}</option>
        </Select>
        <div className="md:col-span-2">
          <Textarea label={t("message")} name="message" rows={4} error={fieldErrors.message} />
        </div>
        <div className="md:col-span-2 flex items-center gap-4">
          <Button type="submit" disabled={status === "sending"}>
            {t("submit")}
          </Button>
          {status === "success" && <span className="text-sm text-cones-blue">{t("success")}</span>}
          {status === "error" && <span className="text-sm text-red-400">{t("error")}</span>}
        </div>
      </form>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/events/RsvpForm.tsx app/api/rsvp lib/validation .env.local.example
git commit -m "feat: rsvp form with zod validation and api route"
```

---

### Task 22: Assemble events page

**Files:**
- Create: `app/[locale]/events/page.tsx`

- [ ] **Step 1: Implement events page**

Create `app/[locale]/events/page.tsx`:
```tsx
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  upcomingEventsQuery,
  pastEventsQuery,
  practiceScheduleQuery,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import SectionHeading from "@/components/ui/SectionHeading";
import EventsTabs from "@/components/events/EventsTabs";
import RsvpForm from "@/components/events/RsvpForm";
import type { EventItem } from "@/components/events/EventCard";
import type { PracticeRow } from "@/components/events/PracticeTable";

type EventDoc = {
  _id: string;
  title: { sr?: string; en?: string };
  startAt: string;
  endAt?: string;
  kind?: string;
  venue?: { sr?: string; en?: string };
  city?: string;
  description?: { sr?: string; en?: string };
  rsvpUrl?: string;
  image?: { asset?: { _ref: string } };
};

function toItem(d: EventDoc): EventItem {
  return {
    _id: d._id,
    title: d.title,
    startAt: d.startAt,
    endAt: d.endAt,
    kind: d.kind,
    venue: d.venue,
    city: d.city,
    description: d.description,
    rsvpUrl: d.rsvpUrl,
    imageUrl: d.image ? urlFor(d.image).width(900).height(600).fit("crop").url() : null,
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");

  const [upcoming, past, schedule] = await Promise.all([
    sanityFetch<EventDoc[]>({ query: upcomingEventsQuery, tags: ["event"] }),
    sanityFetch<EventDoc[]>({ query: pastEventsQuery, tags: ["event"] }),
    sanityFetch<PracticeRow[]>({ query: practiceScheduleQuery, tags: ["practice"] }),
  ]);

  return (
    <div className="mx-auto max-w-container px-6 py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="mt-12">
        <EventsTabs
          upcoming={upcoming.map(toItem)}
          past={past.map(toItem)}
          schedule={schedule}
        />
      </div>
      <RsvpForm />
    </div>
  );
}
```

- [ ] **Step 2: Run tests and build**

Run: `pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/events/page.tsx
git commit -m "feat: events page with tabs, practice schedule, rsvp form"
```

---

## Phase 8 — SEO, metadata, and structured data

### Task 23: Global metadata helper and root metadata

**Files:**
- Create: `lib/seo/metadata.ts`, `lib/seo/jsonLd.ts`

- [ ] **Step 1: Metadata helpers**

Create `lib/seo/metadata.ts`:
```ts
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
```

- [ ] **Step 2: JSON-LD helpers**

Create `lib/seo/jsonLd.ts`:
```ts
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
      name: locale === "sr" ? "Ledeni park Pionir, Beograd" : "Pionir Ice Park, Belgrade",
      address: {
        "@type": "PostalAddress",
        addressCountry: "RS",
        addressLocality: "Belgrade",
        streetAddress: "Čarli Čaplina 39",
      },
    },
    sameAs: [
      "https://instagram.com/conesbelgrade",
      "https://facebook.com/conesbelgrade",
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
    location: locationName ? { "@type": "Place", name: locationName } : undefined,
    url,
  };
}
```

- [ ] **Step 3: Wire root metadata + JSON-LD into locale layout**

Edit `app/[locale]/layout.tsx` to add `generateMetadata` and inject SportsTeam JSON-LD:

Add above `LocaleLayout`:
```tsx
import type { Metadata } from "next";
import { rootMetadata } from "@/lib/seo/metadata";
import { sportsTeamJsonLd } from "@/lib/seo/jsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return rootMetadata(locale);
}
```

And inside the `<body>` before `<Nav />`:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeamJsonLd(locale)) }}
/>
```

Also import `Locale`:
```tsx
import type { Locale } from "@/i18n/routing";
```

- [ ] **Step 4: Commit**

```bash
git add lib/seo app/[locale]/layout.tsx
git commit -m "feat: root seo metadata, hreflang alternates, sportsteam jsonld"
```

---

### Task 24: Per-page metadata

**Files:**
- Modify: `app/[locale]/page.tsx`, `app/[locale]/news/page.tsx`, `app/[locale]/events/page.tsx`

- [ ] **Step 1: Homepage metadata**

Add to `app/[locale]/page.tsx` at top:
```tsx
import type { Metadata } from "next";
import { rootMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return rootMetadata(locale, "/");
}
```

- [ ] **Step 2: News listing metadata**

Since the news listing page is currently a server component delegating to a client component, add to `app/[locale]/news/page.tsx`:
```tsx
import type { Metadata } from "next";
import { rootMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = rootMetadata(locale, "/news");
  const t = await getTranslations({ locale, namespace: "newsPage" });
  return { ...base, title: t("title"), description: t("description") };
}
```

- [ ] **Step 3: Events metadata**

Add to `app/[locale]/events/page.tsx`:
```tsx
import type { Metadata } from "next";
import { rootMetadata } from "@/lib/seo/metadata";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = rootMetadata(locale, "/events");
  const t = await getTranslations({ locale, namespace: "events" });
  return { ...base, title: t("title"), description: t("description") };
}
```

- [ ] **Step 4: Inject NewsArticle JSON-LD in article page**

In `app/[locale]/news/[slug]/page.tsx` render — inside the `<article>`, before `<header>` — add:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(
      newsArticleJsonLd({
        url: `${process.env.SITE_URL ?? ""}/${locale}/news/${slug}`,
        headline: title,
        description: excerpt,
        image: coverUrl ?? undefined,
        datePublished: doc.publishedAt,
        locale,
      })
    ),
  }}
/>
```

And import:
```tsx
import { newsArticleJsonLd } from "@/lib/seo/jsonLd";
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]
git commit -m "feat: per-page metadata and news article jsonld"
```

---

### Task 25: Sitemap and robots

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`

- [ ] **Step 1: Sitemap**

Create `app/sitemap.ts`:
```ts
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
```

- [ ] **Step 2: Robots**

Create `app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/api"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 3: Manifest**

Create `app/manifest.ts`:
```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cones Belgrade",
    short_name: "Cones",
    description: "Belgrade hockey club — Cones Belgrade",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0C10",
    theme_color: "#00ADF1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/manifest.ts
git commit -m "feat: sitemap, robots, and web manifest"
```

---

## Phase 9 — Not-found, error pages, accessibility polish

### Task 26: Localized 404 and error pages

**Files:**
- Create: `app/[locale]/not-found.tsx`, `app/not-found.tsx`, `app/[locale]/error.tsx`
- Modify: `messages/sr.json`, `messages/en.json`

- [ ] **Step 1: Extend messages**

Edit `messages/sr.json`:
```json
"notFound": { "title": "Stranica nije pronađena", "description": "Link je možda zastareo. Vrati se na početnu.", "cta": "Nazad na početnu" },
"error": { "title": "Nešto nije u redu", "description": "Pokušaj ponovo ili se vrati kasnije.", "cta": "Pokušaj ponovo" }
```

Edit `messages/en.json`:
```json
"notFound": { "title": "Page not found", "description": "The link may be outdated. Go back home.", "cta": "Back to home" },
"error": { "title": "Something broke", "description": "Please try again or come back later.", "cta": "Try again" }
```

- [ ] **Step 2: Not-found page (locale-aware)**

Create `app/[locale]/not-found.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="font-display text-9xl text-cones-blue">404</p>
      <h1 className="mt-4 font-heading text-3xl uppercase tracking-widest text-surface-50">
        {t("title")}
      </h1>
      <p className="mt-3 text-surface-200">{t("description")}</p>
      <div className="mt-6">
        <Button href="/">{t("cta")}</Button>
      </div>
    </section>
  );
}
```

Create `app/not-found.tsx` (fallback for unmatched roots):
```tsx
import { redirect } from "next/navigation";

export default function RootNotFound() {
  redirect("/sr");
}
```

- [ ] **Step 3: Error boundary**

Create `app/[locale]/error.tsx`:
```tsx
"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="font-display text-9xl text-cones-orange">!</p>
      <h1 className="mt-4 font-heading text-3xl uppercase tracking-widest text-surface-50">{t("title")}</h1>
      <p className="mt-3 text-surface-200">{t("description")}</p>
      <div className="mt-6">
        <button
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center rounded-md bg-cones-blue px-6 font-heading text-sm uppercase tracking-wider text-cones-black hover:bg-cones-blue/90"
        >
          {t("cta")}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app messages
git commit -m "feat: localized not-found and error pages"
```

---

### Task 27: Accessibility audit pass

**Files:**
- Modify: `components/layout/Nav.tsx`, `components/home/*`, `components/events/*`

- [ ] **Step 1: Add skip link**

Edit `app/[locale]/layout.tsx` body — add before `<Nav />`:
```tsx
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-cones-blue focus:text-cones-black focus:px-4 focus:py-2 focus:font-heading"
>
  Skip to content
</a>
```
And add `id="main"` to the `<main>`.

- [ ] **Step 2: Audit heading order**

Run: `pnpm dev`
Visit `/`, `/news`, `/events`, `/en`, an article page. In DevTools Accessibility pane, confirm:
- exactly one `<h1>` per page (Hero's on home; article headline on detail; SectionHeading `<h2>` on subsections);
- nav has `aria-label` if there are multiple nav regions (add `aria-label="Primary"` to the header nav);
- images with meaningful content have non-empty `alt` (decorative use `alt=""`).

Apply fixes where the audit flags issues. Stop server.

- [ ] **Step 3: Respect reduced motion**

Append to `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app components
git commit -m "chore: accessibility polish (skip link, aria-labels, reduced motion)"
```

---

## Phase 10 — End-to-end smoke + production readiness

### Task 28: Playwright smoke tests

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Smoke tests**

Create `e2e/smoke.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("SR home renders hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CONES");
});

test("EN home is reachable and localized", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL(/\/en/);
  await expect(page.getByRole("link", { name: /news/i })).toBeVisible();
});

test("Sitemap is served", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("<urlset");
});

test("Robots is served", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Sitemap:");
});
```

- [ ] **Step 3: Add scripts**

Edit `package.json` scripts:
```json
"e2e": "playwright test",
"e2e:install": "playwright install --with-deps chromium"
```

- [ ] **Step 4: Install browsers once**

Run: `pnpm e2e:install`
Expected: Playwright downloads chromium.

- [ ] **Step 5: Run e2e locally**

Run: `pnpm e2e`
Expected: all 4 smoke tests PASS.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e package.json
git commit -m "test: playwright smoke tests for home, locale, sitemap, robots"
```

---

### Task 29: Build optimization and caching

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add production hardening config**

Edit `next.config.ts`:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@portabletext/react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Verify production build**

Run: `pnpm build && pnpm start`
In another terminal, run: `curl -sI http://localhost:3000 | head`
Expected: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` headers present. Stop server.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "chore: security headers, avif/webp, package import optimization"
```

---

### Task 30: ISR revalidation webhook

**Files:**
- Create: `app/api/revalidate/route.ts`

- [ ] **Step 1: Revalidate route**

Create `app/api/revalidate/route.ts`:
```ts
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const KNOWN_TAGS = new Set([
  "siteSettings",
  "news",
  "event",
  "practice",
  "sponsor",
]);

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tag?: string; slug?: string; _type?: string } = {};
  try {
    body = await request.json();
  } catch {}

  const tag = body.tag ?? body._type;
  if (tag && KNOWN_TAGS.has(tag)) {
    revalidateTag(tag);
  }
  if (body.slug) {
    revalidateTag(`news:${body.slug}`);
  }
  return NextResponse.json({ revalidated: true, tag, slug: body.slug ?? null });
}
```

Add `SANITY_REVALIDATE_SECRET=` to `.env.local.example`.

- [ ] **Step 2: Commit**

```bash
git add app/api/revalidate .env.local.example
git commit -m "feat: revalidate webhook for sanity content updates"
```

---

### Task 31: README and deploy notes

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Create `README.md`:
```markdown
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

## Sanity content
1. Create documents in studio: Site Settings (singleton), Sponsors, News Articles, Events, Practice Sessions.
2. Use the localized fields (SR / EN) for title, excerpt, body, venue, etc.
3. Mark articles `featured` to include on homepage news strip (top 3 by publishedAt).

## Revalidation
Configure a Sanity GROQ-powered webhook to `POST /api/revalidate` with header `x-revalidate-secret: $SANITY_REVALIDATE_SECRET` and body `{ "_type": "newsArticle", "slug": "..." }`.

## Deployment
- Recommended: Vercel. Set env vars in project settings.
- Ensure `SITE_URL` is the canonical public URL.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: readme with setup, commands, and deploy notes"
```

---

## Appendix — Design reference cheat sheet

Extracted from `docs/design-reference/shared.css` and confirmed against `index.html`, `blog.html`, `events.html`. Use these when filling in any detail the Tailwind config didn't cover.

**Colors (authoritative):**
- Brand: `#00ADF1` (blue), `#F7941C` (orange), `#0A0C10` (cones-black)
- Surface scale (900→50): `#0A0C10`, `#11141B`, `#171B24`, `#1E2330`, `#272D3D`, `#3A4255`, `#5B6478`, `#8892A6`, `#B8C0CF`, `#E4E8F0`

**Typography:**
- Display: Bebas Neue 400, tight tracking, massive sizes for hero (~9rem+)
- Heading: Barlow Condensed 500/600/700/800 for section titles, UI labels — usually uppercase with wide letter-spacing
- Body: Inter 400/500/600, 16–18px base

**Spacing (4px base):** Tailwind `p-*` / `m-*` steps 1–32 map directly to the 4px scale in `shared.css`.

**Radii:** sm 4px, md 8px, lg 12px, xl 20px, pill = `9999px`.

**Elevation:** soft shadows plus blue (`0 10px 30px -10px rgba(0,173,241,0.45)`) and orange glows for primary/secondary CTAs.

**Motion guidelines:**
- Section reveal: 24px upward rise, 600ms, cubic-bezier(0.22,1,0.36,1), viewport once.
- Hover lift: `-translate-y-0.5` or `-translate-y-1` on buttons/cards.
- Gallery zoom: `scale-105` over 500ms.
- Ticker: linear 40–45s infinite, `x: ["0%", "-50%"]` with duplicated children.

**Content rules (from `Design System.html`):**
- DO use Bebas for hero/display, Barlow for labels, Inter for prose.
- DON'T mix blue + orange as adjacent filled surfaces; one must be neutral/dark.
- Keep negative space generous — don't crowd sections with copy.

---

## Self-review checklist (run before execution)

- [ ] Phase 1 scaffolds compile and run.
- [ ] next-intl default locale is `sr`; EN paths land under `/en`.
- [ ] Every message key referenced in components exists in BOTH `sr.json` and `en.json`.
- [ ] All Sanity documents used (`siteSettings`, `newsArticle`, `event`, `practiceSession`, `sponsor`) have schemas registered in `sanity/schemas/index.ts`.
- [ ] `sanityFetch` is always called with `tags` that match the revalidate webhook's known tag set.
- [ ] Every Next-image remote URL comes from `cdn.sanity.io` (configured in `next.config.ts`).
- [ ] Hero, About, Gallery, News, Sponsors Ticker, CTA are composed on the homepage — matches the design brief.
- [ ] Blog page has category filter, featured/grid layout, per-slug detail page — matches `blog.html`.
- [ ] Events page has Upcoming/Schedule/Past tabs, practice table, RSVP form — matches `events.html`.
- [ ] Sitemap lists localized routes + hreflang alternates for each.
- [ ] Root and article JSON-LD are injected.
- [ ] `prefers-reduced-motion` is honored.
- [ ] Serbian Latin diacritics render (latin-ext subset loaded for all three fonts).

If any item fails, the fix is in the referenced task — return to it and re-run its test/build steps before moving on.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-19-cones-belgrade-website.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best isolates each task's context.
2. **Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for your review.

Which approach?
