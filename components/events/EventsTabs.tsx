"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";
import EventCard, { type EventItem } from "./EventCard";

type Tab = "upcoming" | "past";

export default function EventsTabs({
  upcoming,
  past,
}: {
  upcoming: EventItem[];
  past: EventItem[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("events");
  const [tab, setTab] = useState<Tab>("upcoming");
  const tabs: Tab[] = ["upcoming", "past"];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10 border-b border-surface-700/60">
        {tabs.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "px-5 py-3 font-heading uppercase tracking-[0.2em] text-xs border-b-2 -mb-px transition-colors cursor-pointer",
              tab === k ? "border-cones-blue text-cones-blue" : "border-transparent text-surface-200 hover:text-surface-50"
            )}
          >
            {t(`tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <div className="grid gap-6 max-w-3xl">
          {upcoming.length === 0
            ? <p className="text-surface-200 py-12 text-center">{t("empty")}</p>
            : upcoming.map((e, i) => <EventCard key={e._id} item={e} locale={locale} index={i} />)
          }
        </div>
      )}

{tab === "past" && (
        <div className="grid gap-6 md:grid-cols-2">
          {past.length === 0
            ? <p className="text-surface-200 py-12 text-center md:col-span-2">{t("empty")}</p>
            : past.map((e, i) => <EventCard key={e._id} item={e} locale={locale} showRsvp={false} index={i} />)
          }
        </div>
      )}
    </>
  );
}
