"use client";

import { useActionState } from "react";
import type { GroupActionState } from "@/actions/groups";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GROUP_COLOR_PALETTE } from "@/lib/colors";

type GroupFormValues = {
  name: string;
  color: string;
};

type GroupFormProps = {
  action: (
    prevState: GroupActionState,
    formData: FormData,
  ) => Promise<GroupActionState>;
  initialValues?: GroupFormValues;
  submitLabel: string;
};

const initialState: GroupActionState = {};

export function GroupForm({
  action, // フォーム送信用に、新規作成か更新の関数を受け取る。
  initialValues,
  submitLabel,
}: GroupFormProps) {

  // action: サブミット時に呼び出される関数（アクション）
  // initialState: アクションに関連するStateの初期値
  // state: 現在のステート。初回レンダリング時には引数initialStateの値、アクション実行後は戻り値。
  // submitAction: アクション関数。
  // isPending: 処理中であるかを表すフラグ。
  const [state, submitAction, isPending] = useActionState(action, initialState);

  return (
    <form action={submitAction} className="flex flex-wrap items-end gap-3">
      <Field label="名前" htmlFor="name">
        <Input
          id="name"
          name="name"
          type="text"
          required
          maxLength={300}
          defaultValue={initialValues?.name}
        />
      </Field>
      <Field label="色" htmlFor="color">
        <Select
          id="color"
          name="color"
          defaultValue={initialValues?.color ?? "slate"}
        >
          {GROUP_COLOR_PALETTE.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" disabled={isPending}>
        {isPending ? "保存中..." : submitLabel}
      </Button>
      {state.error && (
        <p className="w-full text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
