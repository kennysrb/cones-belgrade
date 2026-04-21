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
    <main className="py-24 border-t border-surface-700/60">
      <div className="mx-auto max-w-container px-6">
        <div className="mb-12">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        </div>
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
