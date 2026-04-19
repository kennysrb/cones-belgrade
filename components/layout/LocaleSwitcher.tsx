"use client";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export default function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const current = useLocale();

  function hrefForLocale(locale: string) {
    if (locale === routing.defaultLocale) return pathname;
    return `/${locale}${pathname === "/" ? "" : pathname}`;
  }

  return (
    <div className={cn("flex items-center gap-1 text-sm font-heading", className)}>
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <a
            key={locale}
            href={hrefForLocale(locale)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-2 py-1 uppercase tracking-widest transition-colors",
              active ? "text-cones-blue" : "text-surface-200 hover:text-surface-50"
            )}
          >
            {locale}
          </a>
        );
      })}
    </div>
  );
}
