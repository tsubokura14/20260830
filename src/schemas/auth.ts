import { z } from "zod";

// users.passwordHash は平文パスワードと1:1に対応しないため、drizzle-zodではなく手書きする
// （思考プロセス_仕様.md「drizzle-zod：Zodが不要になるわけではないと整理」参照）
export const loginFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内で入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;
