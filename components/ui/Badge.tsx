import { cn } from "@/lib/utils/cn";

type Tone = "blue" | "orange" | "neutral";

const toneClasses: Record<Tone, string> = {
  blue: "bg-cones-blue/15 text-cones-blue",
  orange: "bg-cones-orange/15 text-cones-orange",
  neutral: "bg-surface-600 text-surface-100",
};

export default function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-heading uppercase tracking-widest",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
