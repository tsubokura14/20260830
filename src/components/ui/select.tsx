import { type SelectHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={clsx(
          "w-full appearance-none rounded-md border border-slate-300 py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
          className,
        )}
        {...props}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
      >
        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
