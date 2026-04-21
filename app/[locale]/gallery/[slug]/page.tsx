import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { sanityFetch } from "@/lib/sanity/fetch";
import { galleryAlbumBySlugQuery, allGallerySlugsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { pickLocale } from "@/lib/sanity/types";
import type { GalleryAlbum } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { SITE_URL, ogLocale, alternatesForPath } from "@/lib/seo/metadata";
import AlbumViewer from "@/components/gallery/AlbumViewer";

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: allGallerySlugsQuery,
    tags: ["galleryAlbum"],
  }).catch(() => [] as string[]);
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const album = await sanityFetch<GalleryAlbum | null>({
      query: galleryAlbumBySlugQuery,
      params: { slug },
      tags: ["galleryAlbum"],
    });
    if (!album) return {};
    const title = pickLocale(album.title, locale);
    const coverImageUrl = album.coverImage?.asset
      ? urlFor(album.coverImage).width(1200).height(630).fit("crop").url()
      : undefined;
    return {
      title,
      alternates: alternatesForPath(`/gallery/${slug}`, locale),
      openGraph: {
        title,
        url: `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}/gallery/${slug}`,
        locale: ogLocale(locale),
        images: coverImageUrl
          ? [{ url: coverImageUrl, width: 1200, height: 630 }]
          : [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
      },
    };
  } catch {
    return {};
  }
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "galleryPage" });

  let album: GalleryAlbum | null = null;
  try {
    album = await sanityFetch<GalleryAlbum | null>({
      query: galleryAlbumBySlugQuery,
      params: { slug },
      tags: ["galleryAlbum"],
    });
  } catch {
    album = null;
  }

  if (!album) notFound();

  const photos = (album.photos ?? [])
    .filter((p) => p.image?.asset)
    .map((p) => ({
      _key: p._key,
      imageUrl: urlFor(p.image!).width(2000).fit("max").auto("format").url(),
      title: pickLocale(p.title, locale),
    }));

  return (
    <AlbumViewer
      photos={photos}
      albumTitle={pickLocale(album.title, locale)}
      date={album.date}
      locale={locale}
      backLabel={t("backToGallery")}
      backHref="/gallery"
      emptyLabel={t("emptyAlbum")}
      prevPhotoLabel={t("prevPhoto")}
      nextPhotoLabel={t("nextPhoto")}
    />
  );
}
