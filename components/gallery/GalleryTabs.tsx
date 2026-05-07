"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import AlbumGrid from "@/components/gallery/AlbumGrid";
import VideoLightbox from "@/components/gallery/VideoLightbox";
import type { Locale } from "@/i18n/routing";

interface Album {
  _id: string;
  slug: string;
  title: string;
  date: string;
  coverImageUrl: string | null;
  order: number;
}

interface Video {
  id: string;
  title: string;
  date: string;
}

type Tab = "all" | "photos" | "videos";

interface GalleryTabsProps {
  albums: Album[];
  locale: Locale;
  sortManualLabel: string;
  sortDateLabel: string;
  emptyLabel: string;
  videos: Video[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-heading text-xs uppercase tracking-[0.2em] text-cones-blue whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-cones-blue/20" />
    </div>
  );
}

function YTThumb({ videoId, className }: { videoId: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
      alt=""
      className={className}
      onLoad={(e) => {
        const img = e.target as HTMLImageElement;
        // YouTube returns a 120px wide gray placeholder when maxresdefault doesn't exist
        if (img.naturalWidth <= 120) {
          img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }}
    />
  );
}

function FeaturedVideo({ video, onPlay }: { video: Video; onPlay: (v: Video) => void }) {
  return (
    <div className="mb-8 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => onPlay(video)}
        className="group relative w-full pb-[56.25%] block bg-surface-800 rounded-lg overflow-hidden border border-surface-700 cursor-pointer"
      >
        <YTThumb
          videoId={video.id}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/20 transition-colors">
          <div className="w-[72px] h-[72px] rounded-full bg-white/92 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-t-[16px] border-b-[16px] border-l-[26px] border-t-transparent border-b-transparent border-l-surface-900 ml-1.5" />
          </div>
        </div>
      </button>
      <div className="mt-3">
        <p className="font-heading text-xs uppercase tracking-widest text-surface-400 mb-1">{video.date}</p>
        <h3 className="font-display text-xl text-surface-50">{video.title}</h3>
      </div>
    </div>
  );
}

function VideoCard({ video, onPlay }: { video: Video; onPlay: (v: Video) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group text-left w-full cursor-pointer"
    >
      <div className="relative w-full pb-[56.25%] bg-surface-800 rounded-lg overflow-hidden mb-3 border border-surface-700">
        <YTThumb
          videoId={video.id}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/15 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[13px] border-t-transparent border-b-transparent border-l-surface-900 ml-1" />
          </div>
        </div>
      </div>
      <p className="font-heading text-[10px] uppercase tracking-widest text-surface-400 mb-1">{video.date}</p>
      <h3 className="font-display text-sm text-surface-100 leading-snug group-hover:text-cones-blue transition-colors">
        {video.title}
      </h3>
    </button>
  );
}

export default function GalleryTabs({ albums, locale, sortManualLabel, sortDateLabel, emptyLabel, videos }: GalleryTabsProps) {
  const t = useTranslations("galleryPage");
  const [tab, setTab] = useState<Tab>("all");
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const showVideos = tab === "all" || tab === "videos";
  const showPhotos = tab === "all" || tab === "photos";
  const showBothSections = tab === "all";

  const featured = videos[0];
  const rest = videos.slice(1);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t("tabAll") },
    { key: "photos", label: t("tabPhotos") },
    { key: "videos", label: t("tabVideos") },
  ];

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 font-heading text-xs uppercase tracking-widest rounded-md border transition-colors cursor-pointer ${
              tab === key
                ? "border-cones-blue bg-cones-blue text-surface-50 font-bold"
                : "border-surface-400 text-surface-200 hover:border-surface-200 hover:text-surface-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Albums section */}
      {showPhotos && (
        <div className="mb-16">
          {showBothSections && <SectionLabel>{t("sectionPhotos")}</SectionLabel>}
          <AlbumGrid
            albums={albums}
            locale={locale}
            sortManualLabel={sortManualLabel}
            sortDateLabel={sortDateLabel}
            emptyLabel={emptyLabel}
          />
        </div>
      )}

      {/* Videos section */}
      {showVideos && (
        <div>
          {showBothSections && <SectionLabel>{t("sectionVideos")}</SectionLabel>}
          {featured && <FeaturedVideo video={featured} onPlay={setActiveVideo} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((v: Video) => (
              <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
            ))}
          </div>
        </div>
      )}

      {/* Video lightbox */}
      {activeVideo && (
        <VideoLightbox
          videoId={activeVideo.id}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}
