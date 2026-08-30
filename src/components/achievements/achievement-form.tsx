"use client";

import { useActionState } from "react";
import type { AchievementActionState } from "@/actions/achievements";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Group = { id: number; name: string };

type AchievementFormValues = {
  date: string;
  type: "input" | "output";
  groupId: number | null;
  theme: string;
  content: string | null;
};

type AchievementFormProps = {
  action: (
    prevState: AchievementActionState,
    formData: FormData,
  ) => Promise<AchievementActionState>;
  groups: Group[];
  initialValues?: AchievementFormValues;
  submitLabel: string;
};

const initialState: AchievementActionState = {};

export function AchievementForm({
  action,
  groups,
  initialValues,
  submitLabel,
}: AchievementFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="日付" htmlFor="date">
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={initialValues?.date ?? today}
        />
      </Field>

      <Field label="実績種別" htmlFor="type">
        <Select
          id="type"
          name="type"
          required
          defaultValue={initialValues?.type ?? "input"}
        >
          <option value="input">インプット</option>
          <option value="output">アウトプット</option>
        </Select>
      </Field>

      <Field label="グループ" htmlFor="groupId">
        <Select
          id="groupId"
          name="groupId"
          defaultValue={initialValues?.groupId ?? ""}
        >
          <option value="">未設定</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="テーマ" htmlFor="theme">
        <Input
          id="theme"
          name="theme"
          type="text"
          required
          maxLength={300}
          defaultValue={initialValues?.theme}
        />
      </Field>

      <Field label="内容" htmlFor="content">
        <Textarea
          id="content"
          name="content"
          rows={5}
          maxLength={3000}
          defaultValue={initialValues?.content ?? ""}
        />
      </Field>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "保存中..." : submitLabel}
      </Button>
    </form>
  );
}
