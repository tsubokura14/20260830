import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30日

/**
 * JWTの署名・検証に使う秘密鍵を環境変数から取得する。
 */
function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: number;
};

/**
 * ログイン成功時にセッション用のJWTを発行する。
 * @param payload JWTのペイロードに含めるユーザー情報
 * @returns 署名済みJWT文字列（Cookieに保存して使う）
 */
export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * セッションJWTを検証し、有効であればペイロードを返す。
 * 署名不正・期限切れ・改ざんはjwtVerifyが例外として投げるため、
 * 理由を問わず検証失敗は一律nullとして扱い、呼び出し側は未ログイン扱いにする。
 * @param token Cookieから取得したJWT文字列
 * @returns 検証に成功した場合はセッション情報、失敗した場合はnull
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId !== "number") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

/**
 * Server Component / Server Actions内で、ログイン中のユーザーidを取得する。
 * (protected)配下はmiddlewareで未ログイン時にリダイレクト済みのため、
 * ここでnullが返るのは通常想定外だが、呼び出し側でnullチェックする。
 */
export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.userId ?? null;
}

export const sessionCookieOptions = {
  httpOnly: true, // JS(document.cookie)から読めなくし、XSS時のトークン窃取を防ぐ
  secure: process.env.NODE_ENV === "production", // 本番はHTTPS必須。ローカルのhttp開発では無効化
  sameSite: "lax" as const, // CSRF対策。他サイトからのリンク遷移(GET)では送るが、クロスサイトPOST等では送らない
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
