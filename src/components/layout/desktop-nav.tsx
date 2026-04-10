"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CalendarRange, CheckCircle2, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "首页", icon: Sparkles },
  { href: "/schedule", label: "排班", icon: CalendarDays },
  { href: "/calendar", label: "月历", icon: CalendarRange },
  { href: "/analytics", label: "统计", icon: BarChart3 },
  { href: "/tasks", label: "任务", icon: CheckCircle2 },
  { href: "/settings", label: "我的", icon: Palette },
];

export function DesktopNav({ buttonClass }: { buttonClass: string }) {
  const pathname = usePathname();
  return (
    <div className="hidden md:flex md:gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={cn("rounded-2xl px-4 py-3 text-sm font-medium transition", active ? buttonClass : "bg-white/65 text-slate-600 hover:bg-white") }>
            <span className="mr-2 inline-flex align-middle"><Icon className="h-4 w-4" /></span>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
