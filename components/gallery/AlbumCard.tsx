import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/formatDate";
import type { Locale } from "@/i18n/routing";

interface AlbumCardProps {
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string | null;
  locale: Locale;
}

export default function AlbumCard({ slug, title, date, coverImageUrl, locale }: AlbumCardProps) {
  return (
    <Card>
      <Link href={`/gallery/${slug}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-surface-800">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-700" />
          )}
        </div>
        <div className="p-4">
          <p className="font-heading text-xs uppercase tracking-widest text-surface-400 mb-1">{formatDate(date, locale)}</p>
          <h3 className="font-display text-lg text-surface-50 group-hover:text-cones-blue transition-colors line-clamp-2">{title}</h3>
        </div>
      </Link>
    </Card>
  );
}
