"use client";

import { Clock3, Coffee, Star, Wallet } from "lucide-react";
import { useMemo } from "react";
import { StatPill } from "@/components/ui/stat-pill";
import { CuteCard } from "@/components/ui/cute-card";
import { useAppStore } from "@/store/use-app-store";
import { THEME_PRESETS } from "@/lib/constants";
import { getMonthKey, getTodayISO, getWeekDates } from "@/lib/date";
import { computeShift } from "@/lib/payroll";
import { formatCurrency, prettyDuration } from "@/lib/utils";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMounted } from "@/hooks/use-mounted";

export default function AnalyticsPage() {
  const mounted = useMounted();
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const shifts = useAppStore((state) => state.shifts);
  const theme = THEME_PRESETS[settings.theme];
  const today = getTodayISO();
  const weekDates = getWeekDates(new Date(), 0);
  const computed = useMemo(() => shifts.map((shift) => computeShift(shift, settings)), [shifts, settings]);
  const weekShifts = computed.filter((shift) => weekDates.includes(shift.date));
  const monthShifts = computed.filter((shift) => getMonthKey(shift.date) === getMonthKey(today));

  const weekMinutes = weekShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
  const weekBreak = weekShifts.reduce((sum, s) => sum + Number(s.breakMinutes || 0), 0);
  const weekIncome = weekShifts.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
  const workedDays = Array.from(new Set(monthShifts.filter((shift) => !shift.isDayOff).map((shift) => shift.date))).length;
  const averageDailyMinutes = workedDays ? Math.round(monthShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0) / workedDays) : 0;
  const byLocation = Object.entries(monthShifts.reduce<Record<string, number>>((acc, shift) => {
    const key = shift.locationName || "未设置地点";
    acc[key] = (acc[key] || 0) + (shift.workMinutes || 0);
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);

  if (!mounted) return <LoadingPanel />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <CuteCard className={`${theme.card} p-4`}>
        <div className="text-sm font-semibold">时间与工资统计</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <StatPill icon={Clock3} label="本周工时" value={prettyDuration(weekMinutes)} softClass={theme.soft} />
          <StatPill icon={Wallet} label="本周收入" value={formatCurrency(weekIncome, settings.currency)} softClass="bg-white/70 text-slate-700" />
          <StatPill icon={Coffee} label="本周休息" value={prettyDuration(weekBreak)} softClass="bg-white/70 text-slate-700" />
          <StatPill icon={Star} label="平均日工时" value={prettyDuration(averageDailyMinutes)} softClass={theme.soft} />
        </div>
        <div className="mt-4 rounded-[24px] bg-white/60 p-4">
          <div className="mb-3 text-sm font-semibold">地点工时占比</div>
          <div className="space-y-3">
            {byLocation.length ? byLocation.map(([location, minutes]) => {
              const ratio = minutes / Math.max(monthShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0), 1);
              return (
                <div key={location}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span>{location}</span><span className="opacity-70">{(ratio * 100).toFixed(0)}%</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-white"><div className={`${theme.accent} h-full rounded-full`} style={{ width: `${Math.max(6, ratio * 100)}%` }} /></div>
                </div>
              );
            }) : <div className="rounded-2xl bg-white/70 p-4 text-sm opacity-70">还没有足够数据来生成占比哦～</div>}
          </div>
        </div>
      </CuteCard>

      <CuteCard className={`${theme.card} p-4`}>
        <div className="text-sm font-semibold">工资规则</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><div className="mb-1 opacity-70">默认时薪</div><input type="number" step="0.1" value={settings.defaultHourlyRate} onChange={(e) => setSettings({ defaultHourlyRate: Number(e.target.value || 0) })} className="field" /></label>
          <label className="text-sm"><div className="mb-1 opacity-70">加班阈值（小时）</div><input type="number" step="0.5" value={settings.overtimeThresholdHours} onChange={(e) => setSettings({ overtimeThresholdHours: Number(e.target.value || 0) })} className="field" /></label>
          <label className="text-sm"><div className="mb-1 opacity-70">加班倍率</div><input type="number" step="0.1" value={settings.overtimeMultiplier} onChange={(e) => setSettings({ overtimeMultiplier: Number(e.target.value || 0) })} className="field" /></label>
          <label className="text-sm"><div className="mb-1 opacity-70">周末倍率</div><input type="number" step="0.05" value={settings.weekendMultiplier} onChange={(e) => setSettings({ weekendMultiplier: Number(e.target.value || 0) })} className="field" /></label>
          <label className="text-sm"><div className="mb-1 opacity-70">税率</div><input type="number" step="0.01" value={settings.taxRate} onChange={(e) => setSettings({ taxRate: Number(e.target.value || 0) })} className="field" /></label>
          <label className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-3 text-sm"><input type="checkbox" checked={settings.showNetPay} onChange={(e) => setSettings({ showNetPay: e.target.checked })} className="h-4 w-4" /> 统计默认显示税后收入</label>
        </div>
      </CuteCard>
    </div>
  );
}
