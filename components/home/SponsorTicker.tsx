import { useTranslations } from "next-intl";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Ticker from "@/components/motion/Ticker";

export type SponsorItem = { _id: string; name: string; url?: string; logoUrl: string | null };

const LOCAL_FALLBACK: SponsorItem[] = [
  { _id: "1", name: "Banca Intesa",    url: undefined, logoUrl: "/images/sponsors/sponsor-1.png" },
  { _id: "2", name: "Sport Vision",    url: undefined, logoUrl: "/images/sponsors/sponsor-2.png" },
  { _id: "3", name: "Štark",           url: undefined, logoUrl: "/images/sponsors/sponsor-3.png" },
  { _id: "4", name: "Jelen Pivo",      url: undefined, logoUrl: null },
  { _id: "5", name: "Arena Sport",     url: undefined, logoUrl: null },
  { _id: "6", name: "Telenor Serbia",  url: undefined, logoUrl: null },
];

export default function SponsorTicker({ sponsors }: { sponsors: SponsorItem[] }) {
  const t = useTranslations("sponsors");
  const items = sponsors.length ? sponsors : LOCAL_FALLBACK;

  return (
    <section className="py-20 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6 mb-10">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />
      </div>
      <Ticker duration={30} className="mask-fade-x">
        {items.map((s) => (
          <a
            key={s._id}
            href={s.url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-6 md:px-14 transition-transform duration-300 hover:scale-110"
          >
            {s.logoUrl ? (
              <Image
                src={s.logoUrl}
                alt={s.name}
                width={72}
                height={72}
                className="h-20 w-20 md:h-16 md:w-16 object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            ) : null}
            <span className="hidden md:inline font-display text-3xl text-surface-200 hover:text-surface-50 transition-colors whitespace-nowrap">
              {s.name}
            </span>
          </a>
        ))}
      </Ticker>
    </section>
  );
}
