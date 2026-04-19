import Image from "next/image";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { pickLocale } from "@/lib/sanity/types";
import { formatTime } from "@/lib/utils/formatDate";
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
  rsvpUrl?: string | null;
};

export default function EventCard({
  item,
  locale,
  showRsvp = true,
}: {
  item: EventItem;
  locale: Locale;
  showRsvp?: boolean;
}) {
  const t = useTranslations("events");
  const d = new Date(item.startAt);
  const monthLabel = new Intl.DateTimeFormat(locale === "sr" ? "sr-Latn-RS" : "en-GB", { month: "short" }).format(d);

  return (
    <Card className="flex flex-col md:flex-row">
      <div className="relative md:w-64 md:shrink-0 aspect-[4/3] md:aspect-auto">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 256px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-surface-800 to-surface-900" />
        )}
        <div className="absolute top-3 left-3 rounded-md bg-cones-black/80 backdrop-blur px-3 py-2 text-center">
          <p className="font-display text-3xl leading-none text-cones-orange">
            {String(d.getDate()).padStart(2, "0")}
          </p>
          <p className="font-heading text-[10px] uppercase tracking-widest text-surface-100">{monthLabel}</p>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            {item.kind && <Badge tone="blue">{item.kind}</Badge>}
            <span className="text-xs text-surface-300">
              {formatTime(item.startAt, locale)}
              {item.endAt ? ` – ${formatTime(item.endAt, locale)}` : ""}
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
        {showRsvp && item.rsvpUrl && (
          <div><Button href={item.rsvpUrl} variant="primary" size="sm">{t("rsvp")}</Button></div>
        )}
      </div>
    </Card>
  );
}
