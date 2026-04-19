import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { sanityFetch } from "@/lib/sanity/fetch";
import { newsArticleBySlugQuery, allNewsSlugsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/formatDate";
import { articleMetadata } from "@/lib/seo/metadata";
import { newsArticleJsonLd } from "@/lib/seo/jsonLd";
import Badge from "@/components/ui/Badge";
import PortableBody from "@/components/news/PortableBody";

type Doc = {
  _id: string;
  title: { sr?: string; en?: string };
  slug: string;
  category: string;
  publishedAt: string;
  excerpt?: { sr?: string; en?: string };
  body?: { sr?: unknown[]; en?: unknown[] };
  coverImage?: { asset?: { _ref: string } } | null;
};

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
  }).catch(() => null);
  if (!doc) return {};
  const title = pickLocale(doc.title, locale);
  const description = pickLocale(doc.excerpt, locale) ?? undefined;
  const image = doc.coverImage?.asset
    ? urlFor(doc.coverImage).width(1200).height(630).fit("crop").url()
    : undefined;
  return articleMetadata({ locale, slug, title, description, image, publishedAt: doc.publishedAt });
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({ query: allNewsSlugsQuery, tags: ["news"] }).catch(() => [] as string[]);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
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
  }).catch(() => null);

  if (!doc) notFound();

  const title = pickLocale(doc.title, locale);
  const excerpt = pickLocale(doc.excerpt, locale);
  const body = doc.body?.[locale] ?? doc.body?.sr ?? [];
  const coverUrl = doc.coverImage?.asset
    ? urlFor(doc.coverImage).width(1800).fit("max").url()
    : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            newsArticleJsonLd({
              url: `${process.env.SITE_URL ?? "https://conesbelgrade.rs"}/${locale}/news/${slug}`,
              headline: title,
              description: excerpt ?? undefined,
              image: coverUrl ?? undefined,
              datePublished: doc.publishedAt,
              locale,
            })
          ),
        }}
      />
      <Link href="/news" className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-[0.25em] text-cones-blue hover:text-cones-orange">
        ← {t("back")}
      </Link>
      <header className="mt-8 space-y-4">
        <div className="flex items-center gap-3">
          <Badge tone="orange">{doc.category}</Badge>
          <span className="text-xs text-surface-300">{formatDate(doc.publishedAt, locale)}</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl text-surface-50 leading-[0.95]">{title}</h1>
        {excerpt && <p className="text-xl text-surface-200">{excerpt}</p>}
      </header>
      {coverUrl && (
        <figure className="mt-10 overflow-hidden rounded-xl border border-surface-700">
          <Image src={coverUrl} alt="" width={1800} height={1000} className="w-full h-auto" priority />
        </figure>
      )}
      <div className="mt-12">
        <PortableBody value={body as Parameters<typeof PortableBody>[0]["value"]} />
      </div>
    </article>
  );
}
