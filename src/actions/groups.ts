"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { achievementGroups } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { groupFormSchema } from "@/schemas/group";

export type GroupActionState = {
  error?: string;
};

const FOREIGN_KEY_VIOLATION = "23503";

export async function createGroupAction(
  _prevState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  const parsed = groupFormSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  await db.insert(achievementGroups).values({ ...parsed.data, userId });

  revalidatePath("/groups");
  return {};
}

export async function updateGroupAction(
  groupId: number,
  _prevState: GroupActionState,
  formData: FormData,
): Promise<GroupActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  const parsed = groupFormSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  await db
    .update(achievementGroups)
    .set(parsed.data)
    .where(eq(achievementGroups.id, groupId));

  revalidatePath("/groups");
  return {};
}

export async function deleteGroupAction(
  groupId: number,
): Promise<GroupActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  try {
    await db.delete(achievementGroups).where(eq(achievementGroups.id, groupId));
  } catch (error) {
    // 仕様書4.4: 実績が紐づくグループは ON DELETE RESTRICT により削除不可
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === FOREIGN_KEY_VIOLATION
    ) {
      return { error: "紐づく実績があるため削除できません" };
    }
    throw error;
  }

  revalidatePath("/groups");
  return {};
}
