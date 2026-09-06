# 単体テスト

フレームワークは [Vitest](https://vitest.dev/)。設定ファイルは [vitest.config.mts](../../vitest.config.mts)、実行コマンドは`npm run test`。

```ts
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@drizzle": fileURLToPath(new URL("./drizzle", import.meta.url)),
    },
  },
});
```

`include`は`src/**/*.test.ts`だが、`*.integration.test.ts`（結合テスト、[test_結合.md](./test_結合.md)参照）は`exclude`で明示的に除外している。単体テストと結合テストはファイル名の末尾で区別し、別々のVitest設定ファイル・別々のnpmスクリプトで実行する。`resolve.alias`はアプリ本体（`next.config.ts`やTypeScriptの`paths`）で使っている`@/`・`@drizzle`のエイリアスを、テスト実行時にも同じように解決できるようにするための設定。

## 何を単体テストの対象にしているか

単体テストは「DBに依存しない、入力から出力が一意に決まる純粋なロジック」だけを対象にしている。DBアクセスを伴う処理は単体テストではなく結合テストの対象になる（[test_結合.md](./test_結合.md)参照）。

### バリデーションスキーマ（`src/schemas/*.test.ts`）

[achievement.test.ts](../../src/schemas/achievement.test.ts)・[auth.test.ts](../../src/schemas/auth.test.ts)では、Zodスキーマの境界値を確認している。

```ts
it("テーマ300文字ちょうどは許可する", () => {
  const result = achievementFormSchema.safeParse({ ...base, theme: "あ".repeat(300) });
  expect(result.success).toBe(true);
});

it("テーマ301文字は拒否する", () => {
  const result = achievementFormSchema.safeParse({ ...base, theme: "あ".repeat(301) });
  expect(result.success).toBe(false);
});
```

「ちょうど上限」と「上限+1」の両方をテストするのが特徴。これは`off-by-one`（境界値のズレ）のバグ——例えば`.max(300)`と書くべきところを誤って`.max(301)`や`<`と`<=`を取り違えるようなミス——を検出するための定番のテストパターン。同様のペアが`loginFormSchema`のパスワード（8文字）・名前（50文字）や、`achievementFormSchema`の内容（3000文字）にも用意されている。

### 日付計算ロジック（`src/lib/date.test.ts`）

[date.test.ts](../../src/lib/date.test.ts)では、ヒートマップの色分けロジックと、月間カレンダー生成ロジックをテストしている。

```ts
describe("getHeatmapLevel", () => {
  it.each([
    [0, 0], [1, 1], [4, 1], [5, 2], [9, 2], [10, 3], [100, 3],
  ])("count=%i -> level=%i", (count, expected) => {
    expect(getHeatmapLevel(count)).toBe(expected);
  });
});
```

`it.each`で複数の入出力パターンをまとめてテストしている。件数が4→5、9→10に切り替わる境界（レベルが変わる瞬間）を必ず含めているのがポイントで、境界値だけを狙って検証することで少ないテストケース数でも網羅性を担保している。

```ts
describe("getMonthCalendarDays", () => {
  it("週7カラムで割り切れる日数を返す", () => {
    const days = getMonthCalendarDays(2026, 2);
    expect(days.length % 7).toBe(0);
  });

  it("対象月の初日と末日を含む", () => {
    const days = getMonthCalendarDays(2026, 2);
    const keys = days.map((d) => d.dateKey);
    expect(keys).toContain("2026-02-01");
    expect(keys).toContain("2026-02-28");
  });
});
```

ヒートマップ（[heatmap.tsx](../../src/components/stats/heatmap.tsx)）はカレンダーを週7列のグリッドで表示するため、返される日数が必ず7の倍数になっている必要がある（前後月の日付を埋めて調整するロジックがある）。加えて、うるう年でない2026年2月の実日数（28日）が正しく含まれているかも確認している。

## 実行方法

```bash
npm run test        # 1回だけ実行
npx vitest           # watchモード（ファイル変更を検知して再実行）
```

CIでは`npm run lint`・`npm run typecheck`の直後、Neonブランチを使う結合テストより前に実行される（[ci.md](./ci.md)参照）。DBやネットワークに依存しないため、実行が速く、フィードバックが早い。
