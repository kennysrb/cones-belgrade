"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";
import EventCard, { type EventItem } from "./EventCard";
import PracticeTable, { type PracticeRow } from "./PracticeTable";

type Tab = "upcoming" | "schedule" | "past";

export default function EventsTabs({
  upcoming,
  past,
  schedule,
}: {
  upcoming: EventItem[];
  past: EventItem[];
  schedule: PracticeRow[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("events");
  const [tab, setTab] = useState<Tab>("upcoming");
  const tabs: Tab[] = ["upcoming", "schedule", "past"];

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
        <div className="grid gap-6">
          {upcoming.length === 0
            ? <p className="text-surface-200 py-12 text-center">{t("empty")}</p>
            : upcoming.map((e, i) => <EventCard key={e._id} item={e} locale={locale} index={i} />)
          }
        </div>
      )}

      {tab === "schedule" && (
        <div className="space-y-8">
          <PracticeTable rows={schedule} locale={locale} />
          <div className="rounded-xl border border-surface-700 bg-surface-800/50 p-6">
            <p className="font-heading text-sm uppercase tracking-[0.25em] text-cones-orange mb-3">{t("fees.title")}</p>
            <ul className="grid gap-2 text-surface-100 text-sm md:grid-cols-3">
              <li>{t("fees.members")}</li>
              <li>{t("fees.guests")}</li>
              <li>{t("fees.monthly")}</li>
            </ul>
          </div>
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
