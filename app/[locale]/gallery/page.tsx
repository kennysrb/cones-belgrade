import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { galleryAlbumsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import type { GalleryAlbum } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import { rootMetadata } from "@/lib/seo/metadata";
import SectionHeading from "@/components/ui/SectionHeading";
import GalleryTabs from "@/components/gallery/GalleryTabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galleryPage" });
  const base = rootMetadata(locale, "/gallery");
  return { ...base, title: t("title") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "galleryPage" });

  let albums: GalleryAlbum[] = [];
  try {
    albums = await sanityFetch<GalleryAlbum[]>({
      query: galleryAlbumsQuery,
      tags: ["galleryAlbum"],
    });
  } catch {
    albums = [];
  }

  const gridAlbums = albums.map((a) => ({
    _id: a._id,
    slug: a.slug,
    title: pickLocale(a.title, locale),
    date: a.date,
    order: a.order ?? 0,
    coverImageUrl: a.coverImage?.asset
      ? urlFor(a.coverImage).width(800).height(600).fit("crop").url()
      : null,
  }));

  return (
    <main>
      <div className="relative border-b border-surface-700/60 overflow-hidden">
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover object-[center_20%]" style={{ position: "absolute", inset: 0 }} />
          <div className="absolute inset-0 bg-cones-black/90" />
          <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(ellipse at top, rgba(0,173,241,0.2) 0%, transparent 60%)" }} />
        </div>
        <div className="relative mx-auto max-w-container px-6 py-20 md:py-28" style={{ zIndex: 1 }}>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        </div>
      </div>
      <div className="mx-auto max-w-container px-6 py-16">
        <GalleryTabs
          albums={gridAlbums}
          locale={locale}
          sortManualLabel={t("sortManual")}
          sortDateLabel={t("sortDate")}
          emptyLabel={t("empty")}
        />
      </div>
    </main>
  );
}
