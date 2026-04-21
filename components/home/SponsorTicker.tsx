import { useTranslations } from "next-intl";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Ticker from "@/components/motion/Ticker";

export type SponsorItem = {
  _id: string;
  name: string;
  url?: string;
  logoUrl: string | null;
  tier?: "platinum" | "gold" | "silver" | "partner" | null;
};

const TIER_WEIGHT: Record<string, number> = {
  platinum: 4,
  gold: 3,
  silver: 2,
  partner: 1,
};

function buildWeightedList(items: SponsorItem[]): SponsorItem[] {
  // Sort by tier weight descending so highest-tier sponsors lead each "wave"
  const sorted = [...items].sort(
    (a, b) => (TIER_WEIGHT[b.tier ?? "partner"] ?? 1) - (TIER_WEIGHT[a.tier ?? "partner"] ?? 1)
  );

  // Build per-sponsor copy arrays
  const copies = sorted.map((s) => {
    const w = TIER_WEIGHT[s.tier ?? "partner"] ?? 1;
    return Array.from({ length: w }, (_, i) => ({
      ...s,
      _id: i === 0 ? s._id : `${s._id}_${i}`,
    }));
  });

  // Interleave column-by-column: one copy from each sponsor per "wave",
  // so sponsors with more copies appear more often but stay spread out.
  // e.g. [P1,P2,G1,S1,Pa1, P1_1,P2_1,G1_1, P1_2,P2_2,G1_2, P1_3,P2_3]
  const maxWaves = Math.max(...copies.map((c) => c.length));
  const result: SponsorItem[] = [];
  for (let wave = 0; wave < maxWaves; wave++) {
    for (const sponsorCopies of copies) {
      if (wave < sponsorCopies.length) result.push(sponsorCopies[wave]);
    }
  }
  return result;
}

const LOCAL_FALLBACK: SponsorItem[] = [
  { _id: "1", name: "Banca Intesa",   url: undefined, logoUrl: "/images/sponsors/sponsor-1.png", tier: "platinum" },
  { _id: "2", name: "Sport Vision",   url: undefined, logoUrl: "/images/sponsors/sponsor-2.png", tier: "gold" },
  { _id: "3", name: "Štark",          url: undefined, logoUrl: "/images/sponsors/sponsor-3.png", tier: "silver" },
  { _id: "4", name: "Jelen Pivo",     url: undefined, logoUrl: null, tier: "partner" },
  { _id: "5", name: "Arena Sport",    url: undefined, logoUrl: null, tier: "partner" },
  { _id: "6", name: "Telenor Serbia", url: undefined, logoUrl: null, tier: "partner" },
];

export default function SponsorTicker({ sponsors }: { sponsors: SponsorItem[] }) {
  const t = useTranslations("sponsors");
  const raw = sponsors.length ? sponsors : LOCAL_FALLBACK;
  const items = buildWeightedList(raw);

  return (
    <section className="py-20 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6 mb-10">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />
      </div>
      <Ticker duration={55} className="mask-fade-x">
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
