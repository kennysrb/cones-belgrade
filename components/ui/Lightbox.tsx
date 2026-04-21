"use client";
import { useState, useEffect, useCallback } from "react";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  prevLabel?: string;
  nextLabel?: string;
  closeLabel?: string;
}

export default function Lightbox({ images, initialIndex = 0, onClose, prevLabel = "Previous", nextLabel = "Next", closeLabel = "Close" }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label={prevLabel}
        className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
      >
        ←
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={images[index]}
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "calc(100vw - 120px)",
          maxHeight: "calc(100vh - 80px)",
          width: "auto",
          height: "auto",
          display: "block",
          borderRadius: "6px",
        }}
      />

      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label={nextLabel}
        className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
      >
        →
      </button>

      <button
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-surface-700 transition-colors cursor-pointer z-10"
      >
        ✕
      </button>

      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-surface-300 font-heading tracking-widest">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}
