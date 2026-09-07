import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { achievementGroups, achievements, users } from "@drizzle/schema";

// 制約（ON DELETE RESTRICT / 未設定グループへの自動割当）をモックせず実DBに対して検証する。
// DATABASE_URLが無い環境（ローカルの通常テスト実行時など）ではスキップする。
const runIfDbAvailable = process.env.DATABASE_URL ? describe : describe.skip;

runIfDbAvailable("グループ削除の制約（実DB）", () => {
  // このdescribe内の全itで使い回す、テスト専用のユーザーID・グループID。
  // beforeAllで採番され、以降のit・afterAllから参照される。
  let userId: number;
  let groupId: number;

  // 各itの前ではなく、describe全体で1回だけ実行される（beforeEachではない点に注意）。
  // 実DBへのINSERTはコストがあるため、テストごとに作り直さず使い回す設計。
  beforeAll(async () => {
    // 外部キー制約の検証に必要な最小限の親データ（ユーザー）をまず1件作る。
    // passwordHashはログイン検証の対象外なのでダミー値で構わない。
    const [user] = await db
      .insert(users)
      .values({ name: "integration-test-user", passwordHash: "dummy" })
      .returning({ id: users.id }); // 作成したユーザーのIDを取得する。
    userId = user.id;

    // 削除制約の検証対象となるグループを1件作る。
    const [group] = await db
      .insert(achievementGroups)
      .values({ userId, name: "integration-test-group", color: "slate" })
      .returning({ id: achievementGroups.id }); // 削除したユーザーのIDを取得する。
    groupId = group.id;
  });

  // テストが成功しても失敗しても必ず実行され、作成したテストデータを消す。
  // Neonの使い捨てブランチごとCIが破棄するとはいえ、他のテストと混在させないための後片付け。
  // achievements → achievementGroups → users の順で削除しているのは、
  // 逆順で消すと外部キー制約（RESTRICT）に阻まれて削除自体が失敗するため。
  afterAll(async () => {
    await db.delete(achievements).where(eq(achievements.userId, userId));
    await db.delete(achievementGroups).where(eq(achievementGroups.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  });

  // 本題1: グループを参照している実績が存在する状態で削除を試み、
  // Postgres側のON DELETE RESTRICT制約によってDELETE自体が例外で拒否されることを確認する。
  it("実績が紐づくグループは削除できない（ON DELETE RESTRICT）", async () => {
    // beforeAllで作ったgroupIdを参照する実績を1件作り、「紐づいている」状態を作る。
    const [achievement] = await db
      .insert(achievements)
      .values({
        userId,
        groupId,
        type: "input",
        theme: "integration test",
      })
      .returning({ id: achievements.id });

    // モックではなく実際にDELETE文をNeonへ送り、Promiseがrejectする（＝DB側がエラーを返す）ことを検証する。
    await expect(
      db.delete(achievementGroups).where(eq(achievementGroups.id, groupId)),
    ).rejects.toThrow();

    // 次のitの前提（「紐づく実績がない」状態）を壊さないよう、このit内で作った実績を消しておく。
    await db.delete(achievements).where(eq(achievements.id, achievement.id));
  });

  // 本題2: 紐づく実績がなくなれば、同じグループの削除は正常に成功することを確認する。
  // 「常に削除できない」のではなく「実績がある間だけ削除できない」という境界を検証している。
  it("紐づく実績がなくなればグループを削除できる", async () => {
    await expect(
      db.delete(achievementGroups).where(eq(achievementGroups.id, groupId)),
    ).resolves.not.toThrow();
  });
});
