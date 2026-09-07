import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

// 結合テストは本番用の.env.localとは別のDBを使うため、専用の.env.test.localを読み込む。
config({ path: ".env.test.local" });

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
