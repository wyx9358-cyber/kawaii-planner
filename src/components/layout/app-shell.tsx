"use client";

import { ReactNode } from "react";
import { Moon, Sparkles, Sun } from "lucide-react";
import { THEME_PRESETS } from "@/lib/constants";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { useAppStore } from "@/store/use-app-store";
import { formatDateLabel } from "@/lib/date";
import { getTodayISO } from "@/lib/date";

export function AppShell({ children }: { children: ReactNode }) {
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const theme = THEME_PRESETS[settings.theme];
  const wallpaperStyle = settings.wallpaper
    ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,0.34), rgba(255,255,255,0.54)), url(${settings.wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div className={`min-h-screen bg-gradient-to-br text-slate-700 ${theme.bg}`} style={wallpaperStyle}>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pb-8">
        <div className="mx-auto max-w-xl space-y-4 md:max-w-7xl">
          <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl md:p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-medium shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  今天也辛苦啦～继续慢慢变厉害
                </div>
                <h1 className="mt-3 text-2xl font-bold md:text-4xl">Momo Time</h1>
                <p className="mt-1 text-sm opacity-80">可爱排班 · 工时统计 · 工资计算 · 任务打卡 · 主题装扮</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSettings({ darkMode: !settings.darkMode })} className="rounded-2xl bg-white/70 p-3 shadow-sm">
                  {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <div className="rounded-[24px] bg-white/75 px-4 py-3 shadow-sm">
                  <div className="text-xs opacity-70">今日</div>
                  <div className="font-semibold">{formatDateLabel(getTodayISO())}</div>
                </div>
              </div>
            </div>
          </div>

          <DesktopNav buttonClass={theme.button} />
          {children}
        </div>
      </div>
      <BottomNav buttonClass={theme.button} />
    </div>
  );
}
