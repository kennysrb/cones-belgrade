import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";
import ContactForm from "@/components/contact/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = rootMetadata(locale, "/contact");
  const t = await getTranslations({ locale, namespace: "contact" });
  return { ...base, title: t("title"), description: t("description") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="min-h-screen">
      {/* Hero — bold split */}
      <div className="relative border-b border-surface-700/60 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(0,173,241,0.18) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(255,107,0,0.1) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-container px-6 py-24 md:py-36">
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-cones-blue mb-4">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-6xl md:text-8xl xl:text-[9rem] uppercase text-surface-50 leading-none">
            {t("title")}
          </h1>
          <p className="mt-6 text-surface-300 text-lg max-w-md">{t("description")}</p>
        </div>
      </div>

      {/* Body — info strip + form */}
      <div className="mx-auto max-w-container px-6 py-20">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">

          {/* Left — contact info */}
          <div className="lg:pt-2 space-y-10">
            <div>
              <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-cones-orange block mb-3">
                {t("infoTitle")}
              </span>
              <p className="text-surface-200 leading-relaxed">
                Pionir Ice Park<br />
                Čarli Čaplina 39<br />
                Belgrade, Serbia
              </p>
            </div>

            <div>
              <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-cones-orange block mb-3">
                Email
              </span>
              <a
                href="mailto:conesbelgrade@gmail.com"
                className="text-surface-200 hover:text-cones-blue transition-colors break-all"
              >
                conesbelgrade@gmail.com
              </a>
            </div>

            <div className="border-t border-surface-700/60 pt-10">
              <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-cones-orange block mb-4">
                Social
              </span>
              <a
                href="https://www.instagram.com/conesbelgrade"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-surface-200 hover:text-cones-blue transition-colors font-heading text-sm tracking-wide"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @conesbelgrade
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl border border-surface-700/60 bg-surface-900/60 p-8 md:p-12 backdrop-blur-sm">
            <h2 className="font-display text-4xl uppercase text-surface-50 mb-2">{t("formTitle")}</h2>
            <p className="text-surface-400 text-sm mb-10">{t("formSubtitle")}</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
