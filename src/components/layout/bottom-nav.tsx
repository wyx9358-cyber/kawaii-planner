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

export function BottomNav({ buttonClass }: { buttonClass: string }) {
  const pathname = usePathname();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/50 bg-white/75 px-3 py-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("rounded-2xl px-2 py-2 text-center text-[11px] font-medium transition", active ? buttonClass : "bg-white/65 text-slate-600 hover:bg-white") }>
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
