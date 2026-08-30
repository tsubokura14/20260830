import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { achievementGroups } from "@drizzle/schema";
import { GROUP_COLOR_PALETTE } from "@/lib/colors";

export const groupFormSchema = createInsertSchema(achievementGroups, {
  name: (schema) => schema.trim().min(1, "グループ名を入力してください"),
  color: () => z.enum(GROUP_COLOR_PALETTE).default("slate"),
}).omit({ id: true, userId: true });

export type GroupFormInput = z.infer<typeof groupFormSchema>;
