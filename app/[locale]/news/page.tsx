import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";
import { sanityFetch } from "@/lib/sanity/fetch";
import { newsListQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import NewsPageClient from "@/components/news/NewsPageClient";
import PageHero from "@/components/ui/PageHero";
import type { ArticleCardData } from "@/components/news/ArticleCard";

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

type Doc = {
  _id: string;
  slug: string;
  title: { sr?: string; en?: string };
  excerpt?: { sr?: string; en?: string };
  category: string;
  publishedAt: string;
  coverImage?: { asset?: { _ref: string } } | null;
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const docs = await sanityFetch<Doc[]>({ query: newsListQuery, tags: ["news"] }).catch(() => [] as Doc[]);
  const articles: ArticleCardData[] = docs.map((d) => ({
    _id: d._id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    category: d.category,
    publishedAt: d.publishedAt,
    coverImageUrl: d.coverImage?.asset ? urlFor(d.coverImage).width(800).height(500).fit("crop").url() : null,
  }));
  const t = await getTranslations({ locale, namespace: "newsPage" });
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <NewsPageClient articles={articles} />
    </>
  );
}
