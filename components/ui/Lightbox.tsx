"use client";
import { useEffect, useCallback } from "react";
import Image from "next/image";

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onNav: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNav }: LightboxProps) {
  const prev = useCallback(() => onNav((index - 1 + images.length) % images.length), [index, images.length, onNav]);
  const next = useCallback(() => onNav((index + 1) % images.length), [index, images.length, onNav]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
      >
        ←
      </button>

      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[88vh] mx-20"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={images[index]} alt="" fill className="object-contain" sizes="100vw" />
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
      >
        →
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-surface-700 transition-colors cursor-pointer z-10"
      >
        ✕
      </button>

      {/* Counter */}
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-surface-300 font-heading tracking-widest">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}
