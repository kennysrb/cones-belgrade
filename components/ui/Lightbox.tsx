"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt="" fill className="object-contain" sizes="100vw" />
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-surface-700 transition-colors cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
