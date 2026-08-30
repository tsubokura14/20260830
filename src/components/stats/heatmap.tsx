import {
  chunkIntoWeeks,
  getHeatmapLevel,
  getMonthCalendarDays,
  type HeatmapLevel,
} from "@/lib/date";

const LEVEL_CLASSES: Record<HeatmapLevel, string> = {
  0: "bg-slate-100",
  1: "bg-blue-200",
  2: "bg-blue-400",
  3: "bg-blue-600",
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type HeatmapProps = {
  year: number;
  month: number;
  countByDate: Map<string, number>;
};

export function Heatmap({ year, month, countByDate }: HeatmapProps) {
  const days = getMonthCalendarDays(year, month);
  const weeks = chunkIntoWeeks(days);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {weeks.map((week) => (
          <div key={week[0].dateKey} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const count = countByDate.get(day.dateKey) ?? 0;
              const level = getHeatmapLevel(count);
              return (
                <div
                  key={day.dateKey}
                  title={`${day.dateKey}: ${count}件`}
                  className={`aspect-square rounded-sm ${LEVEL_CLASSES[level]} ${
                    day.inCurrentMonth ? "" : "opacity-30"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
