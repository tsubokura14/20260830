"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@drizzle/schema";
import { verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/auth/session";
import { loginFormSchema } from "@/schemas/auth";

// 技術仕様書3.2: 5回失敗で15分ロック
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginFormSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const { name, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.name, name))
    .limit(1);

  if (!user) {
    return { error: "名前またはパスワードが正しくありません" };
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return {
      error:
        "ログイン試行回数が上限に達しました。しばらくしてから再度お試しください",
    };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    const failedAttempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      failedAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_DURATION_MS)
        : null;
    await db
      .update(users)
      .set({ failedLoginAttempts: failedAttempts, lockedUntil })
      .where(eq(users.id, user.id));
    return { error: "名前またはパスワードが正しくありません" };
  }

  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, user.id));

  const token = await signSessionToken({ userId: user.id });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
