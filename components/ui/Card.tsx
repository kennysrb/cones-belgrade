import { cn } from "@/lib/utils/cn";

export default function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-700 bg-surface-800 transition-all hover:border-cones-blue/40 hover:translate-y-[-2px] cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
