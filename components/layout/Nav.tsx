"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/news" as const, label: t("news") },
    { href: "/events" as const, label: t("events") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-surface-700/60 bg-cones-black/80 backdrop-blur-md" style={{ height: "72px" }}>
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-cones-blue text-cones-black font-display text-2xl">
            C
          </span>
          <span className="font-display text-2xl tracking-wide text-surface-50">
            CONES <span className="text-cones-orange">BELGRADE</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-heading text-sm uppercase tracking-[0.25em] text-surface-100 hover:text-cones-blue transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <LocaleSwitcher />
          <Button href="/events" size="sm" variant="primary">
            {t("join")}
          </Button>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          className="md:hidden grid h-10 w-10 place-items-center rounded-md border border-surface-600 text-surface-100"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cn("block h-0.5 w-5 bg-current transition-all", open && "translate-y-1 rotate-45")} />
          <span className={cn("mt-1 block h-0.5 w-5 bg-current transition-all", open && "-translate-y-1 -rotate-45")} />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-surface-700/60 bg-cones-black px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-heading text-base uppercase tracking-widest text-surface-50"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-surface-700/60">
            <LocaleSwitcher />
            <Button href="/events" size="sm">{t("join")}</Button>
          </div>
        </div>
      )}
    </header>
  );
}
