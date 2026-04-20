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
      {/* Background hero image */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div aria-hidden className="absolute inset-0 bg-cones-black/95" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background: "radial-gradient(ellipse at top, rgba(0,173,241,0.25) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(247,148,28,0.18) 0%, transparent 60%)",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-container px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center" style={{ zIndex: 1 }}>
        <Reveal className="space-y-8">
          <Badge tone="blue">{t("eyebrow")}</Badge>
          <h1 className="font-display leading-[0.88] tracking-tight" style={{ fontSize: "clamp(3.25rem,13vw,9rem)" }}>
            <span className="block text-cones-blue">{t("titleLine1")}</span>
            <span className="block text-cones-orange">{t("titleLine2")}</span>
          </h1>
          <p className="max-w-xl text-lg text-surface-100 leading-relaxed">{t("lead")}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/events" variant="primary" size="lg" className="justify-center">{t("ctaPrimary")}</Button>
            <Button href="/news" variant="outline" size="lg" className="justify-center">{t("ctaSecondary")}</Button>
          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-surface-700/60 max-w-xl">
              {stats.map((s) => (
                <StatBlock key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-square w-full max-w-md mx-auto animate-levitate">
          <Image
            src={mascotUrl ?? "/logo.png"}
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
