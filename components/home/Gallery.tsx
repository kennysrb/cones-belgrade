"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import Lightbox from "@/components/ui/Lightbox";

interface AlbumCover {
  _id: string;
  slug: string;
  coverImageUrl: string | null;
  photos: Array<{ _key: string; imageUrl: string }>;
}

const LOCAL_COVERS = [
  { _id: "l1", slug: "", coverImageUrl: "/images/gallery/gallery-1.jpg", photos: [] },
  { _id: "l2", slug: "", coverImageUrl: "/images/gallery/gallery-2.jpg", photos: [] },
  { _id: "l3", slug: "", coverImageUrl: "/images/gallery/gallery-3.jpg", photos: [] },
  { _id: "l4", slug: "", coverImageUrl: "/images/gallery/gallery-4.jpg", photos: [] },
];

const mosaicClasses = [
  "md:col-span-6 md:row-span-2 aspect-[4/3] md:aspect-auto",
  "md:col-span-6 aspect-[4/3] md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
];

interface LightboxState {
  albumIndex: number;
  photoIndex: number;
}

export default function Gallery({ albums }: { albums: AlbumCover[] }) {
  const t = useTranslations("gallery");
  const slots = albums.length ? albums.slice(0, 4) : LOCAL_COVERS;
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const openLightbox = (albumIndex: number) => {
    setLightbox({ albumIndex, photoIndex: 0 });
  };

  const activeAlbum = lightbox !== null ? slots[lightbox.albumIndex] : null;
  const lightboxImages = activeAlbum?.photos.map((p) => p.imageUrl) ?? [];

  return (
    <section className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
          <Link
            href="/gallery"
            className="hidden md:flex items-center gap-2 border border-surface-600 px-5 py-3 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors cursor-pointer rounded-md whitespace-nowrap"
          >
            {t("viewAll")} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3 md:h-[460px]">
          {slots.map((album, i) => (
            <Reveal key={album._id} delay={i * 0.06} className={mosaicClasses[i]}>
              <button
                type="button"
                onClick={() => openLightbox(i)}
                className="relative w-full h-full overflow-hidden rounded-lg border border-surface-700 group cursor-zoom-in block"
              >
                {album.coverImageUrl && (
                  <Image
                    src={album.coverImageUrl}
                    alt={album.slug || "gallery photo"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-3xl select-none">⊕</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex md:hidden">
          <Link
            href="/gallery"
            className="flex items-center gap-2 border border-surface-600 px-5 py-3 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors cursor-pointer rounded-md"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </div>

      {lightbox !== null && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          index={lightbox.photoIndex}
          onClose={() => setLightbox(null)}
          onNav={(idx) => setLightbox((prev) => prev ? { ...prev, photoIndex: idx } : null)}
        />
      )}
    </section>
  );
}
