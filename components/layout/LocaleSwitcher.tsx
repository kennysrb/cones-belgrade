"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { useTransition } from "react";

export default function LocaleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = useLocale();
  const [, startTransition] = useTransition();

  function switchLocale(locale: string) {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  }

  return (
    <div className={cn("flex items-center gap-1 text-sm font-heading", className)}>
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchLocale(locale)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-2 py-1 uppercase tracking-widest transition-colors cursor-pointer",
              active ? "text-cones-blue" : "text-surface-200 hover:text-surface-50"
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
