import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  name: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name" | "children">;

export default function Select({ label, name, children, hint, error, className, required, ...rest }: Props) {
  const id = `sel-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-heading text-xs uppercase tracking-[0.2em] text-surface-200">
        {label}{required && <span className="text-cones-orange"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        className={cn(
          "h-11 rounded-md border border-surface-500 bg-surface-800 px-3 text-sm text-surface-50 focus-visible:outline-none focus-visible:border-cones-blue focus-visible:ring-2 focus-visible:ring-cones-blue/30",
          error && "border-red-500",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-surface-300">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
