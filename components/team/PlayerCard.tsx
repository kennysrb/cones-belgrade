import Image from "next/image";
import { useTranslations } from "next-intl";

export type PlayerData = {
  _id: string;
  name: string;
  nickname?: string | null;
  photoUrl: string | null;
  number?: number | null;
  age?: number | null;
  position?: "forward" | "defense" | "goalie" | null;
  stick?: "L" | "R" | null;
};

export default function PlayerCard({ player }: { player: PlayerData }) {
  const t = useTranslations("team");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-surface-700/60 bg-surface-900 transition-all duration-300 hover:border-cones-blue/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cones-blue/10">
      {/* Photo */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-800">
        {player.photoUrl ? (
          <Image
            src={player.photoUrl}
            alt={player.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg viewBox="0 0 80 80" className="h-20 w-20 text-surface-600" fill="currentColor">
              <circle cx="40" cy="28" r="18" />
              <path d="M4 72c0-19.8 16.2-36 36-36s36 16.2 36 36" />
            </svg>
          </div>
        )}

        {/* Jersey number badge */}
        {player.number != null && (
          <div className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-cones-black/80 backdrop-blur-sm border border-cones-blue/60">
            <span className="font-display text-sm text-cones-blue leading-none">{player.number}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent opacity-80" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <p className="font-display text-lg uppercase text-surface-50 leading-tight">{player.name}</p>
        {player.nickname && (
          <p className="font-heading text-xs text-cones-blue tracking-widest uppercase">"{player.nickname}"</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {player.position && (
            <span className="font-heading text-xs uppercase tracking-wider text-surface-300">
              {t(`positions.${player.position}`)}
            </span>
          )}
          {player.stick && (
            <span className="font-heading text-xs uppercase tracking-wider text-surface-400">
              {t("stick")} {player.stick}
            </span>
          )}
          {player.age != null && (
            <span className="font-heading text-xs uppercase tracking-wider text-surface-400">
              {player.age} {t("age")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
