import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";

export default function About({ teamPhotoUrl }: { teamPhotoUrl: string | null }) {
  const t = useTranslations("about");
  const pillars = [
    { title: t("pillars.passionTitle"), text: t("pillars.passionText") },
    { title: t("pillars.unityTitle"), text: t("pillars.unityText") },
    { title: t("pillars.fairTitle"), text: t("pillars.fairText") },
    { title: t("pillars.communityTitle"), text: t("pillars.communityText") },
  ];

  return (
    <section id="about" className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6 space-y-12">
        <Reveal className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-surface-700">
          <Image
            src={teamPhotoUrl ?? "/images/team/team-photo.jpg"}
            alt="Cones Belgrade team"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </Reveal>

        <div className="grid gap-10 md:grid-cols-2 items-start">
          <Reveal>
            <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid grid-cols-2 gap-6">
              {pillars.map((p) => (
                <li key={p.title} className="rounded-lg border border-surface-700 bg-surface-800/50 p-5">
                  <p className="font-heading text-sm uppercase tracking-[0.2em] text-cones-blue">{p.title}</p>
                  <p className="mt-2 text-sm text-surface-100 leading-relaxed">{p.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
