import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/motion/Reveal";
import { pickLocale } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/formatDate";
import type { Locale } from "@/i18n/routing";

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
          <Link href="/news" className="hidden md:inline font-heading text-xs uppercase tracking-[0.25em] text-cones-blue hover:text-cones-orange">
            {t("cta")} →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {articles.map((a, i) => (
            <Reveal key={a._id} delay={i * 0.08} className="h-full">
              <Card className="h-full">
                <Link href={`/news/${a.slug}`} className="flex flex-col h-full">
                  <div className="relative aspect-[16/10] shrink-0">
                    {a.coverImageUrl ? (
                      <Image src={a.coverImageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge tone="orange">{a.category}</Badge>
                      <span className="text-xs text-surface-300">{formatDate(a.publishedAt, locale)}</span>
                    </div>
                    <h3 className="font-heading text-2xl leading-tight text-surface-50 group-hover:text-cones-blue">{pickLocale(a.title, locale)}</h3>
                    {a.excerpt && <p className="text-sm text-surface-200 line-clamp-2">{pickLocale(a.excerpt, locale)}</p>}
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
