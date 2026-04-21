"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
      >
        ←
      </button>

      <div
        className="relative w-full h-full max-w-5xl max-h-[88vh] mx-20"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={images[index]} alt="" fill className="object-contain" sizes="100vw" />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-cones-blue hover:text-cones-black transition-colors cursor-pointer z-10"
      >
        →
      </button>

      <button
        onClick={onClose}
        aria-label="Close"
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
