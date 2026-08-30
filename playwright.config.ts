import { defineConfig, devices } from "@playwright/test";

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
