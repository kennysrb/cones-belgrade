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

const layoutClasses = [
  "md:col-span-6 md:row-span-2 aspect-square md:aspect-auto",
  "md:col-span-6 aspect-[4/3]",
  "md:col-span-3 aspect-square",
  "md:col-span-3 aspect-square",
  "md:col-span-6 aspect-[16/9]",
];

export default function Gallery({ images }: { images: string[] }) {
  const t = useTranslations("gallery");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const slots = images.length ? images : LOCAL_GALLERY;

  return (
    <section className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {slots.slice(0, 5).map((url, i) => (
            <Reveal key={i} delay={i * 0.05} className={layoutClasses[i]}>
              <button
                type="button"
                onClick={() => setLightboxSrc(url)}
                className="relative w-full h-full overflow-hidden rounded-lg border border-surface-700 group cursor-zoom-in block"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-4xl select-none">+</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </section>
  );
}
