"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import ArticleCard, { type ArticleCardData } from "./ArticleCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils/cn";

const CATEGORIES = ["all", "tournament", "club", "roster", "match", "community"] as const;
type Category = (typeof CATEGORIES)[number];

export default function NewsPageClient({ articles }: { articles: ArticleCardData[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("newsPage");
  const tFilters = useTranslations("newsPage.filters");
  const [category, setCategory] = useState<Category>("all");

  const filtered = useMemo(
    () => (category === "all" ? articles : articles.filter((a) => a.category === category)),
    [articles, category]
  );

  return (
    <div className="mx-auto max-w-container px-6 py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="mt-10 mb-10 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-heading uppercase tracking-widest border transition-colors",
              category === c
                ? "bg-cones-blue text-cones-black border-cones-blue"
                : "border-surface-600 text-surface-100 hover:border-cones-blue hover:text-cones-blue"
            )}
          >
            {tFilters(c)}
          </button>
        ))}
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
