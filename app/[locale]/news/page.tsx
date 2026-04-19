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
  return <NewsPageClient articles={articles} />;
}
