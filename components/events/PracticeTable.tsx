import { useTranslations } from "next-intl";
import { pickLocale } from "@/lib/sanity/types";
import type { Locale } from "@/i18n/routing";

export type PracticeRow = {
  _id: string;
  dayOfWeek: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  startTime: string;
  endTime: string;
  venue?: { sr?: string; en?: string } | null;
  level?: { sr?: string; en?: string } | null;
  notes?: { sr?: string; en?: string } | null;
};

const JS_DAY_TO_KEY: Record<number, PracticeRow["dayOfWeek"]> = {
  0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
};

export default function PracticeTable({
  rows,
  locale,
}: {
  rows: PracticeRow[];
  locale: Locale;
}) {
  const t = useTranslations("events");
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-700">
      <table className="min-w-full divide-y divide-surface-700">
        <thead className="bg-surface-800">
          <tr>
            {(["day", "time", "venue", "level", "notes"] as const).map((k) => (
              <th key={k} className="px-4 py-3 text-left font-heading text-xs uppercase tracking-[0.2em] text-cones-blue">
                {t(`table.${k}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-700/60">
          {rows.map((r) => {
            const isToday = r.dayOfWeek === todayKey;
            return (
              <tr key={r._id} className={isToday ? "bg-cones-blue/10" : ""}>
                <td className="px-4 py-4 font-heading uppercase tracking-widest text-sm">
                  {t(`days.${r.dayOfWeek}`)}
                  {isToday && (
                    <span className="ml-2 rounded-full bg-cones-blue text-cones-black px-2 py-0.5 text-[10px] uppercase tracking-widest">
                      {t("today")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-surface-50">{r.startTime} – {r.endTime}</td>
                <td className="px-4 py-4 text-surface-100">{r.venue ? pickLocale(r.venue, locale) : "—"}</td>
                <td className="px-4 py-4 text-surface-100">{r.level ? pickLocale(r.level, locale) : "—"}</td>
                <td className="px-4 py-4 text-surface-200 text-sm">{r.notes ? pickLocale(r.notes, locale) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
