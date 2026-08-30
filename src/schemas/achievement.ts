import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { achievements } from "@drizzle/schema";

export const achievementFormSchema = createInsertSchema(achievements, {
  theme: (schema) => schema.trim().min(1, "テーマを入力してください"),
  // text型カラムはDB上は文字数無制限のため、上限(3000文字)はここで明示する（仕様書4.5）
  content: (schema) =>
    schema.trim().max(3000, "内容は3000文字以内で入力してください"),
})
  .omit({ id: true, userId: true, groupId: true })
  .extend({
    // グループ未選択時は「未設定」グループへ自動割当（仕様書4.4）。空文字は未選択として扱う
    groupId: z.coerce.number().int().positive().optional(),
  });

export type AchievementFormInput = z.infer<typeof achievementFormSchema>;
