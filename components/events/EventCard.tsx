"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ImageModal from "@/components/ui/ImageModal";
import { pickLocale } from "@/lib/sanity/types";
import { formatTime, formatDateShort, isSameDay } from "@/lib/utils/formatDate";
import { HOCKEY_IMAGES } from "@/lib/constants/images";
import type { Locale } from "@/i18n/routing";

export type EventItem = {
  _id: string;
  title: { sr?: string; en?: string };
  startAt: string;
  endAt?: string | null;
  kind?: string | null;
  venue?: { sr?: string; en?: string } | null;
  city?: string | null;
  description?: { sr?: string; en?: string } | null;
  imageUrl: string | null;
  scheduleImageUrl?: string | null;
  rsvpUrl?: string | null;
};

export default function EventCard({
  item,
  locale,
  showRsvp = true,
  index = 0,
}: {
  item: EventItem;
  locale: Locale;
  showRsvp?: boolean;
  index?: number;
}) {
  const t = useTranslations("events");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const d = new Date(item.startAt);
  const monthLabel = new Intl.DateTimeFormat(locale === "sr" ? "sr-Latn-RS" : "en-GB", { month: "short" }).format(d);
  const fallback = HOCKEY_IMAGES.events[index % HOCKEY_IMAGES.events.length];
  return (
    <>
      <button
        type="button"
        className="w-full text-left cursor-pointer"
        onClick={() => item.scheduleImageUrl && setScheduleOpen(true)}
      >
        <Card className="grid grid-cols-1 md:grid-cols-[220px_1fr] overflow-hidden">
          {/* Image — covers full section, no background visible */}
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[180px] overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
            <Image
              src={item.imageUrl ?? fallback}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 220px"
              className="object-cover"
            />
            <div className="absolute top-2 left-2 rounded-md bg-cones-black/80 backdrop-blur px-2 py-1.5 text-center">
              <p className="font-display text-xl leading-none text-cones-orange">
                {String(d.getDate()).padStart(2, "0")}
              </p>
              <p className="font-heading text-[9px] uppercase tracking-widest text-surface-100">{monthLabel}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                {item.kind && <Badge tone="blue">{item.kind}</Badge>}
                <span className="text-xs text-surface-300">
                  {item.endAt && !isSameDay(item.startAt, item.endAt)
                    ? `${formatDateShort(item.startAt, locale)} – ${formatDateShort(item.endAt, locale)}`
                    : `${formatTime(item.startAt, locale)}${item.endAt ? ` – ${formatTime(item.endAt, locale)}` : ""}`}
                </span>
              </div>
              <h3 className="mt-2 font-heading text-2xl text-surface-50">{pickLocale(item.title, locale)}</h3>
              {item.venue && (
                <p className="text-sm text-surface-200">
                  {pickLocale(item.venue, locale)}{item.city ? `, ${item.city}` : ""}
                </p>
              )}
              {item.description && (
                <p className="mt-3 text-sm text-surface-200">{pickLocale(item.description, locale)}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 border border-surface-600 px-4 py-2 font-heading text-xs uppercase tracking-widest text-surface-100 hover:border-cones-blue hover:text-cones-blue transition-colors rounded-md">
                {t("viewSchedule")} →
              </span>
              {showRsvp && item.rsvpUrl && (
                <span onClick={(e) => e.stopPropagation()}>
                  <Button href={item.rsvpUrl} variant="primary" size="sm">{t("rsvp")}</Button>
                </span>
              )}
            </div>
          </div>
        </Card>
      </button>

      {scheduleOpen && item.scheduleImageUrl && (
        <ImageModal src={item.scheduleImageUrl} onClose={() => setScheduleOpen(false)} />
      )}
    </>
  );
}
