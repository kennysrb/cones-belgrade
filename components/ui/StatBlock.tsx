export default function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-5xl text-cones-blue">{value}</span>
      <span className="mt-1 font-heading text-xs uppercase tracking-widest text-surface-200">
        {label}
      </span>
    </div>
  );
}
