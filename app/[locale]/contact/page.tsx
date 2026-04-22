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
        <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[center_20%]" />
        <div className="absolute inset-0 bg-cones-black/85" />
        <div
          className="absolute inset-0 opacity-40"
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
                Mirka Milojkovića 27<br />
                Beograd, Srbija
              </p>
            </div>

            <div>
              <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-cones-orange block mb-3">
                Email
              </span>
              <a href="mailto:conesbelgrade@gmail.com" className="text-surface-200 hover:text-cones-blue transition-colors break-all">
                conesbelgrade@gmail.com
              </a>
            </div>

            <div className="border-t border-surface-700/60 pt-8">
              <span className="font-heading text-[10px] uppercase tracking-[0.3em] text-cones-orange block mb-4">
                Social
              </span>
              <ul className="space-y-3">
                <li>
                  <a href="https://instagram.com/cones_belgrade011/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-surface-200 hover:text-cones-blue transition-colors text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-800 border border-surface-700">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z"/></svg>
                    </span>
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com/icehockeybelgrade" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-surface-200 hover:text-cones-blue transition-colors text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-800 border border-surface-700">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                    </span>
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com/@conesbelgrade" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-surface-200 hover:text-cones-blue transition-colors text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-800 border border-surface-700">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </span>
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl border border-surface-500 bg-surface-700 p-8 md:p-12">
            <h2 className="font-display text-4xl uppercase text-surface-50 mb-2">{t("formTitle")}</h2>
            <p className="text-surface-400 text-sm mb-10">{t("formSubtitle")}</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
