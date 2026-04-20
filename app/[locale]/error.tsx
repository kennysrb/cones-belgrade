"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="font-display text-9xl text-cones-orange">!</p>
      <h1 className="mt-4 font-heading text-3xl uppercase tracking-widest text-surface-50">{t("title")}</h1>
      <p className="mt-3 text-surface-200">{t("description")}</p>
      <div className="mt-6">
        <button
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center rounded-md bg-cones-blue px-6 font-heading text-sm uppercase tracking-wider text-cones-black hover:bg-cones-blue/90"
        >
          {t("cta")}
        </button>
      </div>
    </section>
  );
}
