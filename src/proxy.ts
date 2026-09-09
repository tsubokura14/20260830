import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

// Next.js 16の規約ファイル（旧middleware.ts）。src/直下に置くと
// matcherにマッチする全リクエストで、実際のページ処理より前に自動実行される。
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// /login自体と静的アセット（無限リダイレクトや不要な検証を避けるため）を除く、
// 認証が必要な全ページ・全APIをここで一括ガードする。
export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
