import type { ReactNode } from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
import { RegisterSW } from "@/components/pwa/register-sw";

export const metadata: Metadata = {
  title: "Momo Time",
  description: "可爱风个人排班与时间管理 App",
  applicationName: "Momo Time",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
