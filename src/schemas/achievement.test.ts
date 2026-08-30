import { describe, expect, it } from "vitest";
import { achievementFormSchema } from "@/schemas/achievement";

const base = {
  date: "2026-01-01",
  type: "input" as const,
  theme: "テスト",
  content: "",
  groupId: undefined,
};

describe("achievementFormSchema", () => {
  it("テーマ300文字ちょうどは許可する", () => {
    const result = achievementFormSchema.safeParse({
      ...base,
      theme: "あ".repeat(300),
    });
    expect(result.success).toBe(true);
  });

  it("テーマ301文字は拒否する", () => {
    const result = achievementFormSchema.safeParse({
      ...base,
      theme: "あ".repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it("テーマ空文字は拒否する", () => {
    const result = achievementFormSchema.safeParse({ ...base, theme: "" });
    expect(result.success).toBe(false);
  });

  it("内容3000文字ちょうどは許可する", () => {
    const result = achievementFormSchema.safeParse({
      ...base,
      content: "あ".repeat(3000),
    });
    expect(result.success).toBe(true);
  });

  it("内容3001文字は拒否する", () => {
    const result = achievementFormSchema.safeParse({
      ...base,
      content: "あ".repeat(3001),
    });
    expect(result.success).toBe(false);
  });

  it("内容は空でも許可する", () => {
    const result = achievementFormSchema.safeParse({ ...base, content: "" });
    expect(result.success).toBe(true);
  });
});
