import { useTranslations } from "next-intl";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Ticker from "@/components/motion/Ticker";

export type SponsorItem = { _id: string; name: string; url?: string; logoUrl: string | null };

export default function SponsorTicker({ sponsors }: { sponsors: SponsorItem[] }) {
  const t = useTranslations("sponsors");

  const items = sponsors.length
    ? sponsors
    : ["Jelen Pivo", "Arena Sport", "Telenor Serbia", "Štark", "BWIN", "Adidas"].map((name, i) => ({
        _id: String(i), name, url: undefined, logoUrl: null,
      }));

  return (
    <section className="py-20 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6 mb-10">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />
      </div>
      <Ticker duration={45} className="mask-fade-x">
        {items.map((s) => (
          <a
            key={s._id}
            href={s.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 px-8 py-4 border-x border-surface-700/60"
          >
            {s.logoUrl ? (
              <Image src={s.logoUrl} alt={s.name} width={120} height={60} className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
            ) : (
              <span className="font-display text-3xl text-surface-100">{s.name}</span>
            )}
          </a>
        ))}
      </Ticker>
    </section>
  );
}
