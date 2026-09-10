"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { achievementGroups } from "@drizzle/schema";
import { getCurrentUserId } from "@/lib/auth/session";
import { groupFormSchema } from "@/schemas/group";

export type GroupActionState = {
  error?: string;
};

// ON DELETE RESTRICTによる削除拒否は23503(foreign_key_violation)ではなく
// 23001(restrict_violation)としてPostgreSQLから返される。
const RESTRICT_VIOLATION = "23001";

export async function createGroupAction(
  _prevState: GroupActionState, // 前回のこのアクションの実行結果
  formData: FormData, // フォームに入力された値
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

  const [updated] = await db
    .update(achievementGroups)
    .set(parsed.data)
    .where(
      and(
        eq(achievementGroups.id, groupId),
        eq(achievementGroups.userId, userId),
      ),
    )
    .returning({ id: achievementGroups.id });

  if (!updated) return { error: "グループが見つかりません" };

  revalidatePath("/groups");
  return {};
}

export async function deleteGroupAction(
  groupId: number,
): Promise<GroupActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "ログインが必要です" };

  try {
    const [deleted] = await db
      .delete(achievementGroups)
      .where(
        and(
          eq(achievementGroups.id, groupId),
          eq(achievementGroups.userId, userId),
        ),
      )
      .returning({ id: achievementGroups.id });

    if (!deleted) return { error: "グループが見つかりません" };
  } catch (error) {
    // 仕様書4.4: 実績が紐づくグループは ON DELETE RESTRICT により削除不可
    // DrizzleはNeonドライバの生エラー(code付き)をラップしてthrowするため、
    // コードは error.code ではなく error.cause.code に入っている。
    const cause = error instanceof Error ? error.cause : undefined;
    if (
      typeof cause === "object" &&
      cause !== null &&
      "code" in cause &&
      (cause as { code?: string }).code === RESTRICT_VIOLATION
    ) {
      return { error: "紐づく実績があるため削除できません" };
    }
    throw error;
  }

  revalidatePath("/groups");
  return {};
}
