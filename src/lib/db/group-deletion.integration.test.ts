import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { achievementGroups, achievements, users } from "@drizzle/schema";

// 技術仕様書5.2: 仕様書4.4の重要な制約（ON DELETE RESTRICT / 未設定グループへの自動割当）を
// モックせず実DBに対して検証する。DATABASE_URLが無い環境（ローカルの通常テスト実行時など）ではスキップする。
const runIfDbAvailable = process.env.DATABASE_URL ? describe : describe.skip;

runIfDbAvailable("グループ削除の制約（実DB）", () => {
  let userId: number;
  let groupId: number;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({ name: "integration-test-user", passwordHash: "dummy" })
      .returning({ id: users.id });
    userId = user.id;

    const [group] = await db
      .insert(achievementGroups)
      .values({ userId, name: "integration-test-group", color: "slate" })
      .returning({ id: achievementGroups.id });
    groupId = group.id;
  });

  afterAll(async () => {
    await db.delete(achievements).where(eq(achievements.userId, userId));
    await db.delete(achievementGroups).where(eq(achievementGroups.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  });

  it("実績が紐づくグループは削除できない（ON DELETE RESTRICT）", async () => {
    const [achievement] = await db
      .insert(achievements)
      .values({
        userId,
        groupId,
        type: "input",
        theme: "integration test",
      })
      .returning({ id: achievements.id });

    await expect(
      db.delete(achievementGroups).where(eq(achievementGroups.id, groupId)),
    ).rejects.toThrow();

    await db.delete(achievements).where(eq(achievements.id, achievement.id));
  });

  it("紐づく実績がなくなればグループを削除できる", async () => {
    await expect(
      db.delete(achievementGroups).where(eq(achievementGroups.id, groupId)),
    ).resolves.not.toThrow();
  });
});
