"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import Lightbox from "@/components/ui/Lightbox";

const LOCAL_GALLERY = [
  "/images/gallery/gallery-1.jpg",
  "/images/gallery/gallery-2.jpg",
  "/images/gallery/gallery-3.jpg",
  "/images/gallery/gallery-4.jpg",
  "/images/gallery/gallery-5.jpg",
];

// 4-image mosaic: big left (row-span-2) + top-right + 2 bottom-right
const mosaicClasses = [
  "md:col-span-6 md:row-span-2 aspect-[4/3] md:aspect-auto",
  "md:col-span-6 aspect-[4/3] md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
  "md:col-span-3 aspect-square md:aspect-auto",
];

export default function Gallery({ images }: { images: string[] }) {
  const t = useTranslations("gallery");
  const slots = images.length ? images : LOCAL_GALLERY;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="hidden md:flex items-center gap-2 border border-surface-600 px-5 py-3 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors cursor-pointer rounded-md whitespace-nowrap"
          >
            {t("viewAll")} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3 md:h-[460px]">
          {slots.slice(0, 4).map((url, i) => (
            <Reveal key={i} delay={i * 0.06} className={mosaicClasses[i]}>
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="relative w-full h-full overflow-hidden rounded-lg border border-surface-700 group cursor-zoom-in block"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-3xl select-none">⊕</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 flex md:hidden">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="flex items-center gap-2 border border-surface-600 px-5 py-3 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors cursor-pointer rounded-md"
          >
            {t("viewAll")} →
          </button>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={slots}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}
    </section>
  );
}
