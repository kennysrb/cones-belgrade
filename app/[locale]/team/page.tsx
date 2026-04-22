import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";
import { sanityFetch } from "@/lib/sanity/fetch";
import { playersQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImageRef } from "@/lib/sanity/types";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import PlayerCard, { type PlayerData } from "@/components/team/PlayerCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = rootMetadata(locale, "/team");
  const t = await getTranslations({ locale, namespace: "team" });
  return { ...base, title: t("title"), description: t("description") };
}

type PlayerDoc = {
  _id: string;
  name: string;
  nickname?: string | null;
  photo?: SanityImageRef;
  number?: number | null;
  age?: number | null;
  position?: "forward" | "defense" | "goalie" | null;
  stick?: "L" | "R" | null;
};

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "team" });
  const docs = await sanityFetch<PlayerDoc[]>({ query: playersQuery, tags: ["player"] }).catch(() => [] as PlayerDoc[]);

  const players: PlayerData[] = docs.map((d) => ({
    _id: d._id,
    name: d.name,
    nickname: d.nickname,
    photoUrl: d.photo?.asset ? urlFor(d.photo).width(600).height(800).fit("crop").url() : null,
    number: d.number,
    age: d.age,
    position: d.position,
    stick: d.stick,
  }));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      {/* Intro strip */}
      <section className="border-t border-surface-700/60 pt-14 pb-2">
        <div className="mx-auto max-w-container px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
            />
            <p className="text-surface-300 text-lg leading-relaxed">{t("intro")}</p>
          </div>
        </div>
      </section>

      {/* Player grid */}
      <section className="border-t border-surface-700/60 py-20">
        <div className="mx-auto max-w-container px-6">
          {players.length === 0 ? (
            <p className="text-center text-surface-400 py-20">{t("empty")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {players.map((p) => (
                <PlayerCard key={p._id} player={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
