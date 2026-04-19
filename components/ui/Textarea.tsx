import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;

export default function Textarea({ label, name, hint, error, className, required, rows = 4, ...rest }: Props) {
  const id = `ta-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-heading text-xs uppercase tracking-[0.2em] text-surface-200">
        {label}{required && <span className="text-cones-orange"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        className={cn(
          "rounded-md border border-surface-500 bg-surface-800 p-3 text-sm text-surface-50 placeholder:text-surface-300 focus-visible:outline-none focus-visible:border-cones-blue focus-visible:ring-2 focus-visible:ring-cones-blue/30",
          error && "border-red-500",
          className
        )}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-surface-300">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
