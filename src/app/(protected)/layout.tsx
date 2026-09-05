import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/actions/auth";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_ITEMS = [
  { href: "/", label: "一覧" },
  { href: "/achievements/new", label: "記録" },
  { href: "/groups", label: "グループ" },
  { href: "/stats", label: "集計" },
];

const APP_NAME = "実績記録アプリ";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="relative border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8 lg:px-12">
          <Link href="/" className="shrink-0 text-base font-semibold text-slate-900">
            {APP_NAME}
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
            <nav className="flex flex-1 items-center justify-center gap-8 text-sm">
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
            <form action={logoutAction} className="shrink-0">
              <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
                ログアウト
              </button>
            </form>
          </div>

          <MobileNav navItems={NAV_ITEMS} logoutAction={logoutAction} />
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 lg:px-12">{children}</div>
    </div>
  );
}
