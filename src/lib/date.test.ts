import { describe, expect, it } from "vitest";
import { getHeatmapLevel, getMonthCalendarDays } from "@/lib/date";

describe("getHeatmapLevel", () => {
  it.each([
    [0, 0],
    [1, 1],
    [4, 1],
    [5, 2],
    [9, 2],
    [10, 3],
    [100, 3],
  ])("count=%i -> level=%i", (count, expected) => {
    expect(getHeatmapLevel(count)).toBe(expected);
  });
});

describe("getMonthCalendarDays", () => {
  it("週7カラムで割り切れる日数を返す", () => {
    const days = getMonthCalendarDays(2026, 2);
    expect(days.length % 7).toBe(0);
  });

  it("対象月の初日と末日を含む", () => {
    const days = getMonthCalendarDays(2026, 2);
    const keys = days.map((d) => d.dateKey);
    expect(keys).toContain("2026-02-01");
    expect(keys).toContain("2026-02-28");
  });
});
