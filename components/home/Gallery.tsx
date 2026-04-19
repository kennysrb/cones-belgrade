import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

const layoutClasses = [
  "md:col-span-6 md:row-span-2 aspect-square md:aspect-auto",
  "md:col-span-6 aspect-[4/3]",
  "md:col-span-3 aspect-square",
  "md:col-span-3 aspect-square",
  "md:col-span-6 aspect-[16/9]",
];

export default function Gallery({ images }: { images: string[] }) {
  const t = useTranslations("gallery");
  const slots = images.length ? images : Array<null>(5).fill(null);

  return (
    <section className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {slots.slice(0, 5).map((url, i) => (
            <Reveal
              key={i}
              delay={i * 0.05}
              className={`relative overflow-hidden rounded-lg border border-surface-700 group ${layoutClasses[i]}`}
            >
              {url ? (
                <Image src={url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
