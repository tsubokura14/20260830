import { type InputHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Input({
  className,
  ...props
  // InputHTMLAttributes: Inputタグに付与できる属性を全て内包したオブジェクト
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
        className,
      )}
      {...props}
    />
  );
}
