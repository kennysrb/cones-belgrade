"use client";
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
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div
        className="flex gap-16 whitespace-nowrap ticker-track"
        style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
