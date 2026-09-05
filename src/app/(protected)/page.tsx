import { and, eq, gte, lte } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementGroups, achievements } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { GroupBadge } from "@/components/groups/group-badge";
import { MonthFilterForm } from "@/components/achievements/month-filter-form";
import { AchievementTypeIcon } from "@/components/achievements/achievement-type-icon";

type VisualizePageProps = {
  searchParams: Promise<{ year?: string; month?: string; groupId?: string }>;
};

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function VisualizePage({
  searchParams,
}: VisualizePageProps) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1; // 1-12
  const groupId = params.groupId ? Number(params.groupId) : undefined;

  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 0)); // 月末日

  const groups = await db
    .select()
    .from(achievementGroups)
    .where(eq(achievementGroups.userId, userId));

  const groupMap = new Map(groups.map((g) => [g.id, g]));

  const conditions = [
    eq(achievements.userId, userId),
    gte(achievements.date, formatDateKey(rangeStart)),
    lte(achievements.date, formatDateKey(rangeEnd)),
  ];
  if (groupId) conditions.push(eq(achievements.groupId, groupId));

  const monthAchievements = await db
    .select()
    .from(achievements)
    .where(and(...conditions))
    .orderBy(achievements.date);

  const byDate = new Map<string, typeof monthAchievements>();
  for (const item of monthAchievements) {
    const list = byDate.get(item.date) ?? [];
    list.push(item);
    byDate.set(item.date, list);
  }

  // その月の日数を取得（Dateオブジェクト → 数値）
  const daysInMonth = rangeEnd.getUTCDate();
  const todayKey = formatDateKey(now);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1, i + 1));
    return { dateKey: formatDateKey(date), date };
  }).filter((d) => d.dateKey <= todayKey)
    .reverse();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">一覧</h1>

      <MonthFilterForm
        year={year}
        month={month}
        groupId={groupId}
        groups={groups}
      />

      <ul className="flex flex-col gap-3">
        {days.map(({ dateKey, date }) => {
          const dayItems = byDate.get(dateKey) ?? [];
          return (
            <li
              key={dateKey}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="mb-2 text-sm font-medium text-slate-500">
                {date.getUTCMonth() + 1}月{date.getUTCDate()}日
              </p>
              {dayItems.length === 0 ? (
                <p className="text-sm text-slate-400">記録なし</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {dayItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <AchievementTypeIcon type={item.type} />
                      <GroupBadge group={groupMap.get(item.groupId)} />
                      <Link
                        href={`/achievements/${item.id}/edit`}
                        className="text-sm font-medium hover:underline"
                      >
                        {item.theme}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
