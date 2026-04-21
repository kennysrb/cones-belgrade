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

const VIDEOS: Video[] = [
  { id: "U8zNbx97tp0", title: "Cones VS Nogice 22.02.2025.", date: "2025" },
  { id: "MBij5HA7Lks", title: "Subotica Winter Classic 2025", date: "2025" },
  { id: "OBEW1bFwk5I", title: "Cones vs Old Boys SK", date: "2025" },
  { id: "bSh72Cvu0nA", title: "Winter Classic 2025", date: "2025" },
  { id: "FldKxtwOh8c", title: "Cones vs Kol and Vazhe 12", date: "2025" },
  { id: "yu6rZOWZO-Y", title: "Cones vs Kol and Vazhe 10", date: "2025" },
  { id: "Ra_4O-lOHAg", title: "Cones vs Kol and Vazhe 11", date: "2025" },
  { id: "Po5pKLTR64o", title: "Cones vs Kol and Vazhe 8", date: "2025" },
  { id: "3TDbJud2Mtg", title: "Cones vs Kol and Vazhe 9", date: "2025" },
  { id: "XvnxMPh6kwE", title: "Cones vs Kol and Vazhe 7", date: "2025" },
  { id: "JXRes2ucY1U", title: "Cones vs Kol and Vazhe 6", date: "2025" },
  { id: "UTH_jDlnoZk", title: "Cones vs Kol and Vazhe 5", date: "2025" },
  { id: "ezVVmVbLfis", title: "Cones vs Kol and Vazhe 4", date: "2025" },
  { id: "2SApo3Fekuo", title: "Cones vs Kol and Vazhe 3", date: "2025" },
  { id: "pNQTVuK1TRo", title: "Cones vs Kol and Vazhe 2", date: "2025" },
  { id: "v9x_4NttENw", title: "Cones vs Kol and Vazhe 1", date: "2025" },
  { id: "mgjZS0IYt9o", title: "Cones hockey family 2023.", date: "2023" },
  { id: "Lc_nY7VrD_A", title: "Cones ice hockey family Bugarska jul 2023", date: "2023" },
  { id: "Afh5pNL7viI", title: "Cones Belgrade - Srećan rođendan golmane naš :)", date: "2023" },
  { id: "wQirI4Ehk9E", title: "Cones Belgrade hockey family", date: "2023" },
  { id: "b9M6XPaySGA", title: "Cones Belgrade Čunjevi plemenski savet od 23h", date: "2022" },
];

type Tab = "all" | "photos" | "videos";

interface GalleryTabsProps {
  albums: Album[];
  locale: Locale;
  sortManualLabel: string;
  sortDateLabel: string;
  emptyLabel: string;
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
      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
      alt=""
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }}
    />
  );
}

function FeaturedVideo({ video, onPlay }: { video: Video; onPlay: (v: Video) => void }) {
  return (
    <div className="mb-8">
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

export default function GalleryTabs({ albums, locale, sortManualLabel, sortDateLabel, emptyLabel }: GalleryTabsProps) {
  const t = useTranslations("galleryPage");
  const [tab, setTab] = useState<Tab>("all");
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const showVideos = tab === "all" || tab === "videos";
  const showPhotos = tab === "all" || tab === "photos";
  const showBothSections = tab === "all";

  const featured = VIDEOS[0];
  const rest = VIDEOS.slice(1);

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
                ? "border-surface-50 bg-surface-50 text-surface-900"
                : "border-surface-600 text-surface-400 hover:border-surface-400 hover:text-surface-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Videos section */}
      {showVideos && (
        <div className="mb-16">
          {showBothSections && <SectionLabel>{t("sectionVideos")}</SectionLabel>}
          <FeaturedVideo video={featured} onPlay={setActiveVideo} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((v) => (
              <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
            ))}
          </div>
        </div>
      )}

      {/* Albums section */}
      {showPhotos && (
        <div>
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
