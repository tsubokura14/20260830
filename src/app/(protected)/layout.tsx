import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "可視化" },
  { href: "/achievements/new", label: "実績を記録" },
  { href: "/groups", label: "グループ管理" },
  { href: "/stats", label: "実績数確認" },
];

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <nav className="flex gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-600 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
              ログアウト
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}
