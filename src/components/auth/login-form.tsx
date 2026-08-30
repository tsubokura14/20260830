"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="名前" htmlFor="name">
        <Input id="name" name="name" type="text" required autoFocus />
      </Field>
      <Field label="パスワード" htmlFor="password">
        <Input id="password" name="password" type="password" required />
      </Field>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
}
