import Image from "next/image";

export default function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="relative h-64 md:h-80 flex items-end">
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-cones-black/80" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(0,173,241,0.2) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-container px-6 pb-10" style={{ zIndex: 1 }}>
        <p className="font-heading text-xs uppercase tracking-widest text-cones-blue mb-2">
          {eyebrow}
        </p>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-surface-50 leading-none">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-surface-200 max-w-xl">{description}</p>
        )}
      </div>
    </div>
  );
}
