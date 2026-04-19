import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { siteSettingsQuery, featuredNewsQuery, sponsorsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";
import Hero, { type HeroStat } from "@/components/home/Hero";
import About from "@/components/home/About";
import Gallery from "@/components/home/Gallery";
import NewsStrip, { type HomeNewsCard } from "@/components/home/NewsStrip";
import SponsorTicker, { type SponsorItem } from "@/components/home/SponsorTicker";
import CtaBand from "@/components/home/CtaBand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return rootMetadata(locale, "/");
}

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

  async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  }

  const [settings, news, sponsors] = await Promise.all([
    safeFetch(() => sanityFetch<Settings | null>({ query: siteSettingsQuery, tags: ["siteSettings"] }), null),
    safeFetch(() => sanityFetch<NewsDoc[]>({ query: featuredNewsQuery, tags: ["news"] }), []),
    safeFetch(() => sanityFetch<SponsorDoc[]>({ query: sponsorsQuery, tags: ["sponsor"] }), []),
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
    .filter((img): img is NonNullable<typeof img> => Boolean(img?.asset))
    .map((img) => urlFor(img!).width(1200).height(800).fit("crop").url());

  const newsCards: HomeNewsCard[] = news.map((n) => ({
    _id: n._id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    category: n.category,
    publishedAt: n.publishedAt,
    coverImageUrl: n.coverImage?.asset
      ? urlFor(n.coverImage).width(800).height(500).fit("crop").url()
      : null,
  }));

  const sponsorItems: SponsorItem[] = sponsors.map((s) => ({
    _id: s._id,
    name: s.name,
    url: s.url,
    logoUrl: s.logo?.asset
      ? urlFor(s.logo).width(240).height(120).fit("max").url()
      : null,
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
