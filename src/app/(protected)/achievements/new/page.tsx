import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementGroups } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { createAchievementAction } from "@/actions/achievements";
import { AchievementForm } from "@/components/achievements/achievement-form";

export default async function NewAchievementPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const groups = await db
    .select()
    .from(achievementGroups)
    .where(eq(achievementGroups.userId, userId));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">実績を記録</h1>
      <AchievementForm
        action={createAchievementAction}
        groups={groups}
        submitLabel="記録する"
      />
    </div>
  );
}
