import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "学習実績可視化",
  description: "学習の積み上げを可視化するアプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
