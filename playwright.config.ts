import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

// E2E用の認証情報（E2E_USER_NAME等）は.env.test.localに置くため、明示的に読み込む。
// dotenvはデフォルトで.envを読むだけでNext.jsのような.env.local自動読込は行わないため必要。
config({ path: ".env.test.local" });

// 技術仕様書5.3: E2Eはゴールデンパスに絞る。CIには含めず、デプロイ前に手動実行する。
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
