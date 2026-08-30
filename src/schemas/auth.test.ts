import { describe, expect, it } from "vitest";
import { loginFormSchema } from "@/schemas/auth";

describe("loginFormSchema", () => {
  it("8文字ちょうどのパスワードは許可する", () => {
    const result = loginFormSchema.safeParse({
      name: "tester",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("7文字のパスワードは拒否する", () => {
    const result = loginFormSchema.safeParse({
      name: "tester",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("50文字ちょうどの名前は許可する", () => {
    const result = loginFormSchema.safeParse({
      name: "あ".repeat(50),
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("51文字の名前は拒否する", () => {
    const result = loginFormSchema.safeParse({
      name: "あ".repeat(51),
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });
});
