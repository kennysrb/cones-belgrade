import "@/app/globals.css";
import { notFound } from "next/navigation";
import { display, heading, body } from "@/lib/fonts";
import { routing } from "@/i18n/routing";

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
  const { locale } = await params;
  if (!routing.locales.includes(locale as "sr" | "en")) notFound();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${heading.variable} ${body.variable}`}
    >
      <body className="bg-cones-black text-surface-50 font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
