import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

export default function CtaBand() {
  const t = useTranslations("cta");
  return (
    <section
      className="py-20 border-t border-surface-700/60"
      style={{ background: "linear-gradient(135deg, rgba(0,173,241,0.15), rgba(247,148,28,0.12))" }}
    >
      <Reveal className="mx-auto max-w-container px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-5xl md:text-6xl text-surface-50">{t("title")}</h2>
          <p className="mt-3 text-surface-100 max-w-xl">{t("description")}</p>
        </div>
        <div className="flex gap-3">
          <Button href="/events" variant="primary" size="lg">{t("primary")}</Button>
          <Button href="/events" variant="outline" size="lg">{t("secondary")}</Button>
        </div>
      </Reveal>
    </section>
  );
}
