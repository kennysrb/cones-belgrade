"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/news" as const, label: t("news") },
    { href: "/events" as const, label: t("events") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-surface-700/60 bg-cones-black/80 backdrop-blur-md" style={{ height: "72px" }}>
        <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Image src="/logo.png" alt="Cones Belgrade" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="font-display text-2xl tracking-wide text-surface-50">
              CONES <span className="text-cones-orange">BELGRADE</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "font-heading text-sm uppercase tracking-[0.25em] transition-colors",
                    active ? "text-cones-blue" : "text-surface-100 hover:text-cones-blue"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LocaleSwitcher />
            <Button href="/events" size="sm" variant="primary">
              {t("join")}
            </Button>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center items-center h-10 w-10 gap-[5px] cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={cn("block h-0.5 w-6 bg-surface-100 transition-all duration-300 origin-center", open && "translate-y-[7px] rotate-45")} />
            <span className={cn("block h-0.5 w-6 bg-surface-100 transition-all duration-300", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-6 bg-surface-100 transition-all duration-300 origin-center", open && "-translate-y-[7px] -rotate-45")} />
          </button>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden flex flex-col bg-cones-black transition-all duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ top: "72px" }}
      >
        <nav className="flex flex-col flex-1 justify-center items-center gap-10 px-6">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "font-display text-5xl uppercase tracking-widest transition-colors",
                  active ? "text-cones-blue" : "text-surface-50 hover:text-cones-blue"
                )}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between px-6 py-8 border-t border-surface-700/60">
          <LocaleSwitcher />
          <Button href="/events" size="md" onClick={() => setOpen(false)}>{t("join")}</Button>
        </div>
      </div>
    </>
  );
}
