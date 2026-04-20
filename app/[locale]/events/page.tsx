import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";
import { sanityFetch } from "@/lib/sanity/fetch";
import { upcomingEventsQuery, pastEventsQuery, practiceScheduleQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import SectionHeading from "@/components/ui/SectionHeading";
import PageHero from "@/components/ui/PageHero";
import EventsTabs from "@/components/events/EventsTabs";
import RsvpForm from "@/components/events/RsvpForm";
import type { EventItem } from "@/components/events/EventCard";
import type { PracticeRow } from "@/components/events/PracticeTable";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = rootMetadata(locale, "/events");
  const t = await getTranslations({ locale, namespace: "events" });
  return { ...base, title: t("title"), description: t("description") };
}

type EventDoc = {
  _id: string;
  title: { sr?: string; en?: string };
  startAt: string;
  endAt?: string | null;
  kind?: string | null;
  venue?: { sr?: string; en?: string } | null;
  city?: string | null;
  description?: { sr?: string; en?: string } | null;
  rsvpUrl?: string | null;
  image?: { asset?: { _ref: string } } | null;
};

function toItem(d: EventDoc): EventItem {
  return {
    _id: d._id,
    title: d.title,
    startAt: d.startAt,
    endAt: d.endAt,
    kind: d.kind,
    venue: d.venue,
    city: d.city,
    description: d.description,
    rsvpUrl: d.rsvpUrl,
    imageUrl: d.image?.asset ? urlFor(d.image).width(900).height(600).fit("crop").url() : null,
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");

  const [upcoming, past, schedule] = await Promise.all([
    sanityFetch<EventDoc[]>({ query: upcomingEventsQuery, tags: ["event"] }).catch(() => [] as EventDoc[]),
    sanityFetch<EventDoc[]>({ query: pastEventsQuery, tags: ["event"] }).catch(() => [] as EventDoc[]),
    sanityFetch<PracticeRow[]>({ query: practiceScheduleQuery, tags: ["practice"] }).catch(() => [] as PracticeRow[]),
  ]);

  return (
    <>
    <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
    <div className="mx-auto max-w-container px-6 py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className="mt-12">
        <EventsTabs upcoming={upcoming.map(toItem)} past={past.map(toItem)} schedule={schedule} />
      </div>
      <RsvpForm />
    </div>
    </>
  );
}
