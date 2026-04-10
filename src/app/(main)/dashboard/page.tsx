"use client";

import { Award, Bell, Coffee, FileText, Plus, Sparkles, Timer, Wallet, Wand2, Clock3 } from "lucide-react";
import { useMemo } from "react";
import { CuteCard } from "@/components/ui/cute-card";
import { StatPill } from "@/components/ui/stat-pill";
import { ProgressRing } from "@/components/ui/progress-ring";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useAppStore } from "@/store/use-app-store";
import { THEME_PRESETS } from "@/lib/constants";
import { getMonthKey, getTodayISO, getWeekDates } from "@/lib/date";
import { formatCurrency, prettyDuration } from "@/lib/utils";
import { computeShift, groupByDate } from "@/lib/payroll";
import Link from "next/link";
import { useMounted } from "@/hooks/use-mounted";

export default function DashboardPage() {
  const mounted = useMounted();
  const settings = useAppStore((state) => state.settings);
  const shifts = useAppStore((state) => state.shifts);
  const tasks = useAppStore((state) => state.tasks);
  const taskLogs = useAppStore((state) => state.taskLogs);

  const theme = THEME_PRESETS[settings.theme];
  const today = getTodayISO();
  const weekDates = getWeekDates(new Date(), 0);

  const computed = useMemo(() => shifts.map((shift) => computeShift(shift, settings)), [shifts, settings]);
  const byDate = useMemo(() => groupByDate(computed), [computed]);
  const todayShifts = byDate[today] || [];
  const weekShifts = computed.filter((shift) => weekDates.includes(shift.date));
  const monthShifts = computed.filter((shift) => getMonthKey(shift.date) === getMonthKey(today));
  const completedTaskIds = new Set(taskLogs.filter((log) => log.date === today && log.completed).map((log) => log.taskId));

  const weekMinutes = weekShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
  const weekIncome = weekShifts.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
  const monthMinutes = monthShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
  const monthIncome = monthShifts.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
  const todayMinutes = todayShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
  const todayBreak = todayShifts.reduce((sum, s) => sum + Number(s.breakMinutes || 0), 0);
  const todayIncome = todayShifts.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
  const weekBars = weekDates.map((date) => {
    const dayShifts = byDate[date] || [];
    const minutes = dayShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
    return { date, minutes };
  });
  const maxMinutes = Math.max(...weekBars.map((item) => item.minutes), 1);
  const badges = [
    weekMinutes >= 20 * 60 ? "本周 20+ 小时达成" : "继续累积本周工时吧～",
    completedTaskIds.size >= 3 ? "今日任务达人" : "今天也在稳稳前进",
    monthShifts.length >= 4 ? "本月记录习惯很好" : "保持记录会更有成就感",
  ];

  if (!mounted) return <LoadingPanel />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <CuteCard className={`${theme.card} p-4`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm opacity-70">今日概览</div>
              {!!todayShifts.length ? (
                <>
                  <div className="mt-2 text-xl font-bold">{todayShifts.length} 个班次 · {prettyDuration(todayMinutes)}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className={`${theme.soft} rounded-full px-3 py-1`}><Timer className="mr-1 inline h-3.5 w-3.5" /> 实际 {prettyDuration(todayMinutes)}</span>
                    <span className="rounded-full bg-white/70 px-3 py-1"><Coffee className="mr-1 inline h-3.5 w-3.5" /> 休息 {prettyDuration(todayBreak)}</span>
                    <span className="rounded-full bg-white/70 px-3 py-1"><Wallet className="mr-1 inline h-3.5 w-3.5" /> {settings.showNetPay ? "税后" : "税前"} {formatCurrency(todayIncome, settings.currency)}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {todayShifts.map((shift) => (
                      <div key={shift.id} className="rounded-2xl bg-white/70 px-3 py-3 text-sm">
                        <div className="font-medium">{shift.isDayOff ? "休息日" : `${shift.startTime} - ${shift.endTime}`}</div>
                        <div className="mt-1 opacity-70">{shift.locationName || "未设置地点"} · {shift.roleName || "未设置岗位"}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-3 rounded-3xl bg-white/70 p-4 text-sm">今天还没有班次记录，去排班页加一个吧～</div>
              )}
            </div>
            <ProgressRing value={Math.round((weekMinutes / (35 * 60)) * 100)} color={theme.iconHex} />
          </div>
        </CuteCard>

        <div className="grid gap-4 md:grid-cols-2">
          <CuteCard className={`${theme.card} p-4`}>
            <div className="mb-3 text-sm font-semibold">本周累计</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatPill icon={Clock3} label="总工时" value={prettyDuration(weekMinutes)} softClass={theme.soft} />
              <StatPill icon={Wallet} label="总收入" value={formatCurrency(weekIncome, settings.currency)} softClass="bg-white/70 text-slate-700" />
            </div>
          </CuteCard>
          <CuteCard className={`${theme.card} p-4`}>
            <div className="mb-3 text-sm font-semibold">本月累计</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatPill icon={Clock3} label="总工时" value={prettyDuration(monthMinutes)} softClass={theme.soft} />
              <StatPill icon={Wallet} label="总收入" value={formatCurrency(monthIncome, settings.currency)} softClass="bg-white/70 text-slate-700" />
            </div>
          </CuteCard>
        </div>

        <CuteCard className={`${theme.card} p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">近 7 天工时趋势</div>
              <div className="text-xs opacity-60">越忙的时候柱子会更高一点</div>
            </div>
          </div>
          <div className="flex h-44 items-end gap-2 rounded-[24px] bg-white/55 p-3">
            {weekBars.map((bar) => (
              <div key={bar.date} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div className="text-[10px] opacity-60">{bar.minutes ? `${(bar.minutes / 60).toFixed(1)}h` : "0h"}</div>
                <div className={`${theme.accent} w-full rounded-t-2xl`} style={{ height: `${Math.max(12, (bar.minutes / maxMinutes) * 110)}px` }} />
              </div>
            ))}
          </div>
        </CuteCard>
      </div>

      <div className="space-y-4">
        <CuteCard className={`${theme.card} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">今日任务</div>
              <div className="text-xs opacity-60">{completedTaskIds.size}/{tasks.length} 已完成</div>
            </div>
            <span className={`${theme.soft} rounded-full px-3 py-1 text-xs font-medium`}>连击中 ✨</span>
          </div>
          <div className="mt-3 space-y-2">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-2xl bg-white/70 px-3 py-3 text-sm">
                <div className="font-medium">{task.icon} {task.title}</div>
                <div className="mt-1 text-xs opacity-60">{completedTaskIds.has(task.id) ? "已完成" : "待完成"}</div>
              </div>
            ))}
          </div>
        </CuteCard>

        <CuteCard className={`${theme.card} p-4`}>
          <div className="text-sm font-semibold">徽章与提醒</div>
          <div className="mt-3 space-y-2">
            {badges.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-3 text-sm"><Award className="h-4 w-4" /> {item}</div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium"><Bell className="h-4 w-4" /> 可爱提醒文案</div>
            <div className="space-y-1 text-xs opacity-70">
              <div>• 该准备出发上班啦～</div>
              <div>• 别忘了记录今天的班次哦～</div>
              <div>• 今天也认真完成了好多事！</div>
            </div>
          </div>
        </CuteCard>

        <CuteCard className={`${theme.card} p-4`}>
          <div className="text-sm font-semibold">快捷入口</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/schedule" className={`${theme.button} rounded-2xl px-4 py-4 text-center text-sm font-medium`}><Plus className="mx-auto mb-2 h-4 w-4" />新建班次</Link>
            <Link href="/schedule" className="rounded-2xl bg-white/70 px-4 py-4 text-center text-sm font-medium hover:bg-white"><Wand2 className="mx-auto mb-2 h-4 w-4" />文本解析</Link>
            <Link href="/analytics" className="rounded-2xl bg-white/70 px-4 py-4 text-center text-sm font-medium hover:bg-white"><Sparkles className="mx-auto mb-2 h-4 w-4" />看统计</Link>
            <Link href="/settings" className="rounded-2xl bg-white/70 px-4 py-4 text-center text-sm font-medium hover:bg-white"><FileText className="mx-auto mb-2 h-4 w-4" />设置与备份</Link>
          </div>
        </CuteCard>
      </div>
    </div>
  );
}
