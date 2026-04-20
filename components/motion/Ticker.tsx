"use client";
import { useRef, useEffect, useCallback } from "react";
import * as React from "react";

export default function Ticker({
  children,
  duration = 40,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const copy1Ref = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const drag = useRef({ active: false, startX: 0, startTranslate: 0, currentTranslate: 0 });

  // Measure copy width and set CSS var
  useEffect(() => {
    const track = trackRef.current;
    const copy1 = copy1Ref.current;
    if (!track || !copy1) return;
    const update = () => {
      offsetRef.current = copy1.offsetWidth;
      track.style.setProperty("--ticker-offset", `${copy1.offsetWidth}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(copy1);
    return () => ro.disconnect();
  }, []);

  // Get current animated translateX from the live computed style
  const getLiveTranslate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const m = new DOMMatrix(getComputedStyle(track).transform);
    return m.m41;
  }, []);

  // Restart CSS animation from a given pixel translate position
  const resumeFrom = useCallback((translate: number) => {
    const track = trackRef.current;
    if (!track) return;
    const offset = offsetRef.current || 1;
    // Normalize translate into [-offset, 0)
    const normalized = ((translate % offset) + offset) % offset - offset;
    const progress = Math.abs(normalized) / offset;
    const delay = -(progress * duration);
    track.style.transform = "";
    track.style.animation = "none";
    void track.offsetHeight; // force reflow
    track.style.animation = `ticker-scroll ${duration}s linear ${delay}s infinite`;
  }, [duration]);

  const startDrag = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const tx = getLiveTranslate();
    // Freeze current position
    track.style.animation = "none";
    track.style.transform = `translateX(${tx}px)`;
    drag.current = { active: true, startX: clientX, startTranslate: tx, currentTranslate: tx };
  }, [getLiveTranslate]);

  const moveDrag = useCallback((clientX: number) => {
    if (!drag.current.active) return;
    const track = trackRef.current;
    if (!track) return;
    const delta = clientX - drag.current.startX;
    const newTx = drag.current.startTranslate + delta;
    drag.current.currentTranslate = newTx;
    track.style.transform = `translateX(${newTx}px)`;
  }, []);

  const endDrag = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    resumeFrom(drag.current.currentTranslate);
  }, [resumeFrom]);

  return (
    <div
      className={`overflow-hidden select-none ${className ?? ""}`}
      // Touch
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
      onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
      onTouchEnd={endDrag}
      onTouchCancel={endDrag}
      // Mouse (desktop hover pause + drag)
      onMouseEnter={() => { if (!drag.current.active && trackRef.current) trackRef.current.style.animationPlayState = "paused"; }}
      onMouseLeave={() => { if (!drag.current.active && trackRef.current) trackRef.current.style.animationPlayState = "running"; endDrag(); }}
      onMouseDown={(e) => startDrag(e.clientX)}
      onMouseMove={(e) => moveDrag(e.clientX)}
      onMouseUp={endDrag}
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap ticker-track"
        style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
      >
        <div ref={copy1Ref} className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
