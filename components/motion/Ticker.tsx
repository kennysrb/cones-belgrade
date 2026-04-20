"use client";
import { useRef, useEffect } from "react";
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

  useEffect(() => {
    const track = trackRef.current;
    const copy1 = copy1Ref.current;
    if (!track || !copy1) return;
    // Measure exact pixel width of one copy and set it as the animation offset.
    // This avoids subpixel rounding issues with translateX(-50%).
    const update = () => {
      track.style.setProperty("--ticker-offset", `${copy1.offsetWidth}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(copy1);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
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
