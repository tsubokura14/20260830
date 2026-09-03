import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementGroups, achievements } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { MonthFilterForm } from "@/components/achievements/month-filter-form";
import { Heatmap } from "@/components/stats/heatmap";

type StatsPageProps = {
  searchParams: Promise<{ year?: string; month?: string; groupId?: string }>;
};

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;
  const groupId = params.groupId ? Number(params.groupId) : undefined;

  const [groups, allAchievements] = await Promise.all([
    db
      .select()
      .from(achievementGroups)
      .where(eq(achievementGroups.userId, userId)),
    db.select().from(achievements).where(eq(achievements.userId, userId)),
  ]);

  const totalCount = allAchievements.length;

  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const monthAchievements = allAchievements.filter((item) =>
    item.date.startsWith(monthPrefix),
  );

  const filteredAchievements = groupId
    ? monthAchievements.filter((item) => item.groupId === groupId)
    : monthAchievements;

  const countByGroup = new Map<number, number>();
  for (const item of monthAchievements) {
    countByGroup.set(item.groupId, (countByGroup.get(item.groupId) ?? 0) + 1);
  }

  const inputCount = filteredAchievements.filter(
    (item) => item.type === "input",
  ).length;
  const outputCount = filteredAchievements.filter(
    (item) => item.type === "output",
  ).length;

  const countByDate = new Map<string, number>();
  for (const item of filteredAchievements) {
    countByDate.set(item.date, (countByDate.get(item.date) ?? 0) + 1);
  }

  const selectedGroup = groupId ? groups.find((g) => g.id === groupId) : undefined;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-lg font-semibold">実績数確認</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium text-slate-600">
          {year}年{month}月の実績数
          {selectedGroup ? `（${selectedGroup.name}）` : ""}
        </h2>
        <p className="mb-1 text-2xl font-semibold">
          {filteredAchievements.length}件
        </p>
        <p className="mb-3 text-xs text-slate-400">全期間: {totalCount}件</p>
        <table className="w-full text-sm">
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="py-1 text-slate-600">{g.name}</td>
                <td className="py-1 text-right">
                  {countByGroup.get(g.id) ?? 0}件
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <MonthFilterForm year={year} month={month} groupId={groupId} groups={groups} />

        <div className="flex gap-6 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <p>
            インプット: <span className="font-semibold">{inputCount}件</span>
          </p>
          <p>
            アウトプット:{" "}
            <span className="font-semibold">{outputCount}件</span>
          </p>
        </div>

        <Heatmap year={year} month={month} countByDate={countByDate} />
      </section>
    </div>
  );
}
