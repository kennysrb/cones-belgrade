"use client";
import { useState } from "react";
import AlbumCard from "@/components/gallery/AlbumCard";
import type { Locale } from "@/i18n/routing";

interface Album {
  _id: string;
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string | null;
  order: number;
}

interface AlbumGridProps {
  albums: Album[];
  locale: Locale;
  sortManualLabel: string;
  sortDateLabel: string;
  emptyLabel: string;
}

type SortMode = "manual" | "date";

export default function AlbumGrid({ albums, locale, sortManualLabel, sortDateLabel, emptyLabel }: AlbumGridProps) {
  const [sort, setSort] = useState<SortMode>("manual");

  const sorted = [...albums].sort((a, b) => {
    if (sort === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
    return (a.order ?? 0) - (b.order ?? 0);
  });

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {(["manual", "date"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSort(mode)}
            className={`px-4 py-2 font-heading text-xs uppercase tracking-widest rounded-md border transition-colors cursor-pointer ${
              sort === mode
                ? "border-cones-blue bg-cones-blue text-surface-50 font-bold"
                : "border-surface-400 text-surface-200 hover:border-surface-200 hover:text-surface-50"
            }`}
          >
            {mode === "manual" ? sortManualLabel : sortDateLabel}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-surface-400">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((album) => (
            <AlbumCard
              key={album._id}
              slug={album.slug}
              title={album.title}
              date={album.date}
              coverImageUrl={album.coverImageUrl}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
