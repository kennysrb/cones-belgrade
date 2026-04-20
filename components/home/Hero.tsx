"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatBlock from "@/components/ui/StatBlock";
import Reveal from "@/components/motion/Reveal";

export type HeroStat = { value: string; label: string };

export default function Hero({
  stats,
  mascotUrl,
}: {
  stats: HeroStat[];
  mascotUrl: string | null;
}) {
  const t = useTranslations("hero");
  return (
    <section className="relative overflow-hidden">
      {/* Background hero image — replace /images/hero-bg.jpg with a real photo */}
      <Image
        src="https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1920&q=80"
        alt=""
        fill
        priority
        className="object-cover object-center -z-20"
        sizes="100vw"
      />
      {/* Dark overlay so text stays readable */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-cones-black/70" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          background: "radial-gradient(ellipse at top, rgba(0,173,241,0.25) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(247,148,28,0.18) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-container px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center">
        <Reveal className="space-y-8">
          <Badge tone="blue">
            <span className="h-1.5 w-1.5 rounded-full bg-cones-blue animate-pulse" />
            {t("eyebrow")}
          </Badge>
          <h1 className="font-display leading-[0.88] tracking-tight" style={{ fontSize: "clamp(5rem,14vw,9rem)" }}>
            <span className="block text-cones-blue">{t("titleLine1")}</span>
            <span className="block text-cones-orange">{t("titleLine2")}</span>
          </h1>
          <p className="max-w-xl text-lg text-surface-100 leading-relaxed">{t("lead")}</p>
          <div className="flex flex-wrap gap-4">
            <Button href="/events" variant="primary" size="lg">{t("ctaPrimary")}</Button>
            <Button href="/news" variant="outline" size="lg">{t("ctaSecondary")}</Button>
          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-surface-700/60 max-w-xl">
              {stats.map((s) => (
                <StatBlock key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-square w-full max-w-md mx-auto">
          <Image
            src={mascotUrl ?? "https://images.unsplash.com/photo-1547099882-93ab62c0b459?auto=format&fit=crop&w=800&q=80"}
            alt="Cones Belgrade"
            fill
            priority
            className="object-contain"
            style={{ filter: "drop-shadow(0 20px 60px rgba(0,173,241,0.35))" }}
          />
        </Reveal>
      </div>
    </section>
  );
}
