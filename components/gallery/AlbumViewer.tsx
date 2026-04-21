"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/utils/formatDate";

interface Photo {
  _key: string;
  imageUrl: string;
  title: string;
}

interface AlbumViewerProps {
  photos: Photo[];
  albumTitle: string;
  date: string;
  backLabel: string;
  backHref: string;
  locale: Locale;
  emptyLabel: string;
  prevPhotoLabel: string;
  nextPhotoLabel: string;
}

export default function AlbumViewer({ photos, albumTitle, date, backLabel, backHref, locale, emptyLabel, prevPhotoLabel, nextPhotoLabel }: AlbumViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (photos.length === 0) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-container px-6 mb-6">
          <Link href={backHref} className="font-heading text-xs uppercase tracking-widest text-surface-400 hover:text-cones-blue transition-colors flex items-center gap-1">
            ← {backLabel}
          </Link>
        </div>
        <div className="mx-auto max-w-container px-6">
          <h1 className="font-display text-3xl md:text-4xl text-surface-50 mb-4">{albumTitle}</h1>
          <p className="text-surface-400">{emptyLabel}</p>
        </div>
      </div>
    );
  }

  const active = photos[activeIndex];
  const formatted = formatDate(date, locale);

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mx-auto max-w-container px-6 mb-6 flex items-center gap-4">
        <Link
          href={backHref}
          className="font-heading text-xs uppercase tracking-widest text-surface-400 hover:text-cones-blue transition-colors flex items-center gap-1"
        >
          ← {backLabel}
        </Link>
      </div>

      <div className="mx-auto max-w-container px-6 mb-4">
        <p className="font-heading text-xs uppercase tracking-widest text-surface-400 mb-1">{formatted}</p>
        <h1 className="font-display text-3xl md:text-4xl text-surface-50">{albumTitle}</h1>
        <p className="text-sm text-surface-400 mt-1">{activeIndex + 1} / {photos.length}</p>
      </div>

      {/* Main image */}
      <div className="relative w-full h-[55vh] md:h-[70vh] bg-surface-900 mb-4">
        <Image
          src={active.imageUrl}
          alt={active.title || albumTitle}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label={prevPhotoLabel}
              className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={nextPhotoLabel}
              className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="mx-auto max-w-container px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, i) => (
              <button
                key={photo._key}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded overflow-hidden border-2 transition-colors cursor-pointer ${
                  i === activeIndex ? "border-cones-blue" : "border-surface-700 hover:border-surface-400"
                }`}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title || `Photo ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
