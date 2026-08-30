import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarDay = {
  date: Date;
  dateKey: string; // yyyy-MM-dd
  inCurrentMonth: boolean;
};

/**
 * 指定した年月を含む、週7カラムのカレンダー用グリッドを返す（実績数確認画面5.5用）。
 * 月初・月末の端数週も、前後月の日付を含めて埋める。
 */
export function getMonthCalendarDays(
  year: number,
  month: number, // 1〜12
): CalendarDay[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const start = startOfWeek(startOfMonth(firstOfMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(firstOfMonth), { weekStartsOn: 0 });

  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    dateKey: format(date, "yyyy-MM-dd"),
    inCurrentMonth: isSameMonth(date, firstOfMonth),
  }));
}

export function chunkIntoWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export type HeatmapLevel = 0 | 1 | 2 | 3;

/**
 * 仕様書5.5: 実績件数を4段階（0件 / 1件以上 / 5件以上 / 10件以上）に変換する。
 */
export function getHeatmapLevel(count: number): HeatmapLevel {
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 1) return 1;
  return 0;
}
