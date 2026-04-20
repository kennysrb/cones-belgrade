import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface AlbumCardProps {
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string | null;
}

export default function AlbumCard({ slug, title, date, coverImageUrl }: AlbumCardProps) {
  const formatted = new Date(date).toLocaleDateString("sr-Latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/gallery/${slug}`} className="group block rounded-lg overflow-hidden border border-surface-700 bg-surface-900 hover:border-cones-blue transition-colors">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-800">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-surface-600 text-4xl">📷</div>
        )}
      </div>
      <div className="p-4">
        <p className="font-heading text-xs uppercase tracking-widest text-surface-400 mb-1">{formatted}</p>
        <h3 className="font-display text-lg text-surface-50 group-hover:text-cones-blue transition-colors line-clamp-2">{title}</h3>
      </div>
    </Link>
  );
}
