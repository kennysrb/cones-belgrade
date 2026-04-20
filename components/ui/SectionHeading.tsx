import { cn } from "@/lib/utils/cn";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="mb-2 font-heading text-sm uppercase tracking-widest text-cones-blue">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl uppercase text-surface-50">{title}</h2>
      {description && <p className="mt-3 text-surface-200">{description}</p>}
    </div>
  );
}
