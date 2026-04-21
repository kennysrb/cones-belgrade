"use client";
import { useEffect } from "react";

interface VideoLightboxProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export default function VideoLightbox({ videoId, title, onClose }: VideoLightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-10 right-0 font-heading text-xs uppercase tracking-widest text-surface-400 hover:text-surface-50 transition-colors cursor-pointer"
        >
          ✕ Close
        </button>
        <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
          <iframe
            className="absolute inset-0 w-full h-full border-0"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
        <p className="mt-4 font-heading text-sm uppercase tracking-widest text-surface-300">{title}</p>
      </div>
    </div>
  );
}
