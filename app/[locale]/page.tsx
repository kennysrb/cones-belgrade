import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("hero");
  return (
    <main className="p-8">
      <p className="font-heading text-cones-blue uppercase">{t("eyebrow")}</p>
      <h1 className="font-display text-6xl">
        <span className="text-cones-blue">{t("titleLine1")}</span>{" "}
        <span className="text-cones-orange">{t("titleLine2")}</span>
      </h1>
      <p className="mt-4 max-w-xl">{t("lead")}</p>
    </main>
  );
}
