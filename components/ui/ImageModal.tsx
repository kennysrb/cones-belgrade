"use client";
import { useEffect } from "react";

export default function ImageModal({ src, alt = "", onClose }: { src: string; alt?: string; onClose: () => void }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(900px, 100%)",
          maxHeight: "90vh",
          width: "auto",
          height: "auto",
          borderRadius: "12px",
          display: "block",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-surface-800/80 text-surface-50 hover:bg-surface-700 transition-colors cursor-pointer z-10"
      >
        ✕
      </button>
    </div>
  );
}
