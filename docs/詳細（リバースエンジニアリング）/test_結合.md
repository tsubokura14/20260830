# 結合テスト

フレームワークは単体テストと同じVitestだが、設定ファイルと実行コマンドを分けている。設定は [vitest.integration.config.mts](../../vitest.integration.config.mts)、実行コマンドは`npm run test:integration`。

```ts
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@drizzle": fileURLToPath(new URL("./drizzle", import.meta.url)),
    },
  },
});
```

単体テスト用の設定（`vitest.config.mts`）が`*.integration.test.ts`を明示的に除外しているのと対になっており、ファイル名の末尾（`.test.ts`か`.integration.test.ts`か）だけで、どちらの設定で拾われるかが決まる。

## 単体テストと何が違うのか

単体テストは「DBに依存しない純粋なロジック」だけを対象にする（[test_単体.md](./test_単体.md)参照）のに対し、結合テストは**実際のPostgres（Neon）に対してクエリを実行**し、DBの制約やトランザクションの挙動そのものを検証する。モックを使わないのは、モックした場合「モックの動作」と「本物のDBの動作」がずれてしまうと、テストが通っているのに本番で壊れる、という事態を防げないため。

## 対象: グループ削除の制約（[group-deletion.integration.test.ts](../../src/lib/db/group-deletion.integration.test.ts)）

現時点で結合テストが検証しているのは、[db_tables.md](./db_tables.md)で解説した`achievements.group_id`の`ON DELETE RESTRICT`制約が実際に効くかどうか。

```ts
const runIfDbAvailable = process.env.DATABASE_URL ? describe : describe.skip;

runIfDbAvailable("グループ削除の制約（実DB）", () => {
  // ...
  it("実績が紐づくグループは削除できない（ON DELETE RESTRICT）", async () => {
    const [achievement] = await db.insert(achievements).values({ userId, groupId, type: "input", theme: "integration test" }).returning({ id: achievements.id });

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
```

### `DATABASE_URL`が無い環境では自動的にスキップする

冒頭の`const runIfDbAvailable = process.env.DATABASE_URL ? describe : describe.skip;`が肝で、環境変数`DATABASE_URL`が設定されていなければ、このテストブロックごと`describe.skip`扱いになる。これにより、

- ローカルで`npm run test`（単体テストのみ）を実行する分には、このファイル自体が対象外なので影響しない
- 誤って`npm run test:integration`をDB接続情報なしで実行しても、失敗ではなく「スキップ」として扱われる

という2段構えの安全策になっている。CIでは、直前のステップでNeonの使い捨てブランチを作成し、その接続文字列を`DATABASE_URL`環境変数として渡した状態でこのコマンドを実行するため、実際にはスキップされずテストが走る（[ci.md](./ci.md)参照）。

### `beforeAll` / `afterAll`でのデータ後始末

```ts
beforeAll(async () => {
  const [user] = await db.insert(users).values({ name: "integration-test-user", passwordHash: "dummy" }).returning({ id: users.id });
  userId = user.id;
  const [group] = await db.insert(achievementGroups).values({ userId, name: "integration-test-group", color: "slate" }).returning({ id: achievementGroups.id });
  groupId = group.id;
});

afterAll(async () => {
  await db.delete(achievements).where(eq(achievements.userId, userId));
  await db.delete(achievementGroups).where(eq(achievementGroups.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
});
```

テスト用のユーザー・グループを`beforeAll`で作成し、`afterAll`で必ず削除する。CIでは使い捨てのNeonブランチごと破棄されるため後始末は本来不要だが、ローカルで本番相当のDATABASE_URLを指定して実行するケースも考慮し、テストが作ったデータを残さないようにしている。削除順序が`achievements → achievement_groups → users`になっているのは、外部キー制約の向き（`achievements`が`achievement_groups`と`users`を参照する）と逆順に消さないと、それ自体が外部キー違反になるため。

### 2つのテストケースの意味

1. **「実績が紐づくグループは削除できない」**: あえて削除を試みて、それが例外を投げる（`rejects.toThrow()`）ことを確認する。これは「削除できてしまったらバグ」というネガティブテスト
2. **「紐づく実績がなくなればグループを削除できる」**: 1つ目のテストの中で紐づく実績を削除済みなので、今度は同じグループの削除が成功する（`resolves.not.toThrow()`）ことを確認する。制約が「常にブロックする」のではなく「紐づきがある間だけブロックする」ことまで見ている

## 実行方法

```bash
npm run test:integration
```

事前に`.env.local`の`DATABASE_URL`が有効なNeon接続文字列である必要がある。本番用のDATABASE_URLをそのまま使うと、テストが作成・削除するダミーデータが本番DBに一時的に紛れ込むため、可能であればNeonのブランチ機能で作った検証用DBを指すDATABASE_URLを使うのが望ましい（CIでは実際にそうしている）。
