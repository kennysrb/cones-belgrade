import "@/app/globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { display, heading, body } from "@/lib/fonts";
import { routing, type Locale } from "@/i18n/routing";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { rootMetadata } from "@/lib/seo/metadata";
import { sportsTeamJsonLd } from "@/lib/seo/jsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return rootMetadata(locale);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!(routing.locales as readonly string[]).includes(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${heading.variable} ${body.variable}`}
    >
      <body className="bg-cones-black text-surface-50 font-body antialiased min-h-screen overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-cones-blue focus:text-cones-black focus:px-4 focus:py-2 focus:font-heading"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeamJsonLd(locale)) }}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Nav />
          <main id="main" className="min-h-[calc(100dvh-72px)]">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
