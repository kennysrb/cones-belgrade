import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { pickLocale } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils/formatDate";
import { HOCKEY_IMAGES } from "@/lib/constants/images";
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
  index = 0,
}: {
  article: ArticleCardData;
  locale: Locale;
  index?: number;
}) {
  const fallback = HOCKEY_IMAGES.articles[index % HOCKEY_IMAGES.articles.length];
  return (
    <Card>
      <Link href={`/news/${article.slug}`} className="flex flex-col h-full group">
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
          <Image
            src={article.coverImageUrl ?? fallback}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6 space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Badge tone="orange">{article.category}</Badge>
            <span className="text-xs text-surface-300">{formatDate(article.publishedAt, locale)}</span>
          </div>
          <h3 className="font-heading text-2xl leading-tight text-surface-50 group-hover:text-cones-blue transition-colors">
            {pickLocale(article.title, locale)}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-surface-200 line-clamp-3">{pickLocale(article.excerpt, locale)}</p>
          )}
        </div>
      </Link>
    </Card>
  );
}
