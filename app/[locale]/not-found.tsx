import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="font-display text-9xl text-cones-blue">404</p>
      <h1 className="mt-4 font-heading text-3xl uppercase tracking-widest text-surface-50">
        {t("title")}
      </h1>
      <p className="mt-3 text-surface-200">{t("description")}</p>
      <div className="mt-6">
        <Button href="/">{t("cta")}</Button>
      </div>
    </section>
  );
}
