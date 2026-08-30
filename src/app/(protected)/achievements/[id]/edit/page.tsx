import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementGroups, achievements } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { updateAchievementAction } from "@/actions/achievements";
import { AchievementForm } from "@/components/achievements/achievement-form";
import { DeleteAchievementButton } from "@/components/achievements/delete-achievement-button";

type EditAchievementPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAchievementPage({
  params,
}: EditAchievementPageProps) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id } = await params;
  const achievementId = Number(id);
  if (!Number.isInteger(achievementId)) notFound();

  const [achievement] = await db
    .select()
    .from(achievements)
    .where(
      and(eq(achievements.id, achievementId), eq(achievements.userId, userId)),
    )
    .limit(1);
  if (!achievement) notFound();

  const groups = await db
    .select()
    .from(achievementGroups)
    .where(eq(achievementGroups.userId, userId));

  const boundAction = updateAchievementAction.bind(null, achievementId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">実績を編集</h1>
        <DeleteAchievementButton achievementId={achievement.id} />
      </div>
      <AchievementForm
        action={boundAction}
        groups={groups}
        submitLabel="更新する"
        initialValues={{
          date: achievement.date,
          type: achievement.type,
          groupId: achievement.groupId,
          theme: achievement.theme,
          content: achievement.content,
        }}
      />
    </div>
  );
}
