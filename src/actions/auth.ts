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
    // 「名前が存在しない」と「パスワードが違う」を区別するとユーザー名の
    // 存在有無が漏れる（ユーザー列挙攻撃）ため、同じ文言で返す。
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
    // 上限に達した回だけロックし、それ未満なら失敗回数のカウントのみ更新する
    // （総当たり攻撃対策。lockedUntilは上限到達時のみ設定される）。
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

  // 正しいパスワードでログインできた時点で、過去の失敗回数・ロックは意味を失うためリセットする。
  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, user.id));

  // ここまで来て初めてセッションを発行する＝以後はCookieの検証だけで
  // 認証済みとみなせる（毎回パスワード照合はしない）。
  const token = await signSessionToken({ userId: user.id });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  // セッションCookieを削除するだけでよい（JWTはサーバー側で無効化する仕組みを持たないため、
  // ブラウザ側からトークンを消すことでログアウトを表現する）。
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
