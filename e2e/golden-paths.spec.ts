import { expect, test } from "@playwright/test";

// 技術仕様書5.3: ゴールデンパス3点。実行には、ログイン可能な初期ユーザーが
// 登録済みの環境（E2E_BASE_URL / E2E_USER_NAME / E2E_USER_PASSWORD）が必要。
// CIには含めず、デプロイ前に手動実行する運用とする。

const userName = process.env.E2E_USER_NAME;
const userPassword = process.env.E2E_USER_PASSWORD;

test.skip(
  !userName || !userPassword,
  "E2E_USER_NAME / E2E_USER_PASSWORD が未設定のためスキップ",
);

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("名前").fill(userName!);
  await page.getByLabel("パスワード").fill(userPassword!);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("/");
}

test("ログイン→実績登録→可視化画面に反映される", async ({ page }) => {
  await login(page);

  await page.getByRole("link", { name: "実績を記録" }).click();
  const theme = `E2Eテスト ${Date.now()}`;
  await page.getByLabel("テーマ").fill(theme);
  await page.getByRole("button", { name: "記録する" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(theme)).toBeVisible();
});

test("実績が紐づくグループは削除できない", async ({ page }) => {
  await login(page);
  await page.goto("/groups");

  // 「未設定」グループは既存実績が必ず紐づいている前提で、削除失敗を確認する
  await page
    .getByRole("listitem")
    .filter({ hasText: "未設定" })
    .getByRole("button", { name: "削除" })
    .click();
  page.once("dialog", (dialog) => dialog.accept());

  await expect(page.getByText("紐づく実績があるため削除できません")).toBeVisible();
});

test("可視化画面のフィルターがURLクエリに反映され、リロードしても保持される", async ({
  page,
}) => {
  await login(page);
  await page.goto("/");

  await page.getByLabel("年").selectOption("2026");
  await page.getByLabel("月").selectOption("1");
  await page.getByRole("button", { name: "絞り込む" }).click();

  await expect(page).toHaveURL(/year=2026&month=1/);
  await page.reload();
  await expect(page).toHaveURL(/year=2026&month=1/);
});
