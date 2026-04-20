import type { Locale } from "@/i18n/routing";

export type LocalizedString = Partial<Record<Locale, string>>;
export type LocalizedText = Partial<Record<Locale, string>>;

export function pickLocale<T extends LocalizedString | LocalizedText>(
  value: T | undefined,
  locale: Locale,
  fallback: Locale = "sr"
): string {
  if (!value) return "";
  return value[locale] ?? value[fallback] ?? "";
}

export type SanityImageRef = { asset?: { _ref: string } } | null | undefined;

export type GalleryPhoto = {
  _key: string;
  image: SanityImageRef;
  title?: LocalizedString;
  description?: LocalizedText;
};

export type GalleryAlbum = {
  _id: string;
  title: LocalizedString;
  slug: string;
  date: string;
  order: number;
  coverImage: SanityImageRef;
  photos?: GalleryPhoto[];
};
