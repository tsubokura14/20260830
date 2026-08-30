"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievementGroups, achievements } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { achievementFormSchema } from "@/schemas/achievement";

export type AchievementActionState = {
  error?: string;
};

const DEFAULT_GROUP_NAME = "未設定";

// 仕様書4.4: グループ未指定時は「未設定」グループへ自動割当。存在しなければ作成する。
async function resolveGroupId(userId: number, groupId?: number) {
  if (groupId) return groupId;

  const [existing] = await db
    .select()
    .from(achievementGroups)
    .where(
      and(
        eq(achievementGroups.userId, userId),
        eq(achievementGroups.name, DEFAULT_GROUP_NAME),
      ),
    )
    .limit(1);
  if (existing) return existing.id;

  const [created] = await db
    .insert(achievementGroups)
    .values({ userId, name: DEFAULT_GROUP_NAME, color: "slate" })
    .returning({ id: achievementGroups.id });
  return created.id;
}

function parseAchievementForm(formData: FormData) {
  return achievementFormSchema.safeParse({
    date: formData.get("date") || undefined,
    type: formData.get("type"),
    theme: formData.get("theme"),
    content: formData.get("content") || undefined,
    groupId: formData.get("groupId") || undefined,
  });
}

export async function createAchievementAction(
  _prevState: AchievementActionState,
  formData: FormData,
): Promise<AchievementActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  const parsed = parseAchievementForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const { groupId, ...values } = parsed.data;
  const resolvedGroupId = await resolveGroupId(userId, groupId);

  await db
    .insert(achievements)
    .values({ ...values, userId, groupId: resolvedGroupId });

  revalidatePath("/");
  revalidatePath("/stats");
  redirect("/");
}

export async function updateAchievementAction(
  achievementId: number,
  _prevState: AchievementActionState,
  formData: FormData,
): Promise<AchievementActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  const parsed = parseAchievementForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const { groupId, ...values } = parsed.data;
  const resolvedGroupId = await resolveGroupId(userId, groupId);

  await db
    .update(achievements)
    .set({ ...values, groupId: resolvedGroupId })
    .where(eq(achievements.id, achievementId));

  revalidatePath("/");
  revalidatePath("/stats");
  redirect("/");
}

export async function deleteAchievementAction(
  achievementId: number,
): Promise<AchievementActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  await db.delete(achievements).where(eq(achievements.id, achievementId));

  revalidatePath("/");
  revalidatePath("/stats");
  return {};
}
