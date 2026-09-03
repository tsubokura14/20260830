"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = { href: string; label: string };

type MobileNavProps = {
  navItems: NavItem[];
  logoutAction: () => void | Promise<void>;
};

export function MobileNav({ navItems, logoutAction }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-6 w-6"
        >
          {open ? (
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full z-20 border-b border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <nav className="flex flex-col gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-2 border-t border-slate-100 pt-2">
            <button
              type="submit"
              onClick={() => setOpen(false)}
              className="w-full rounded-md px-2 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
