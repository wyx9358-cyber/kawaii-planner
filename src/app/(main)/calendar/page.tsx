"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { THEME_PRESETS } from "@/lib/constants";
import { computeShift, groupByDate } from "@/lib/payroll";
import { formatCurrency, prettyDuration } from "@/lib/utils";
import { formatDateLabel, getMonthKey, getMonthMatrix, getTodayISO } from "@/lib/date";
import { DayDrawer } from "@/components/calendar/day-drawer";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMounted } from "@/hooks/use-mounted";

export default function CalendarPage() {
  const mounted = useMounted();
  const settings = useAppStore((state) => state.settings);
  const shifts = useAppStore((state) => state.shifts);
  const theme = THEME_PRESETS[settings.theme];
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [open, setOpen] = useState(false);

  const computed = useMemo(() => shifts.map((shift) => computeShift(shift, settings)), [shifts, settings]);
  const byDate = useMemo(() => groupByDate(computed), [computed]);
  const selectedDayShifts = byDate[selectedDate] || [];
  const currentMonthShifts = computed.filter((shift) => getMonthKey(shift.date) === getMonthKey(getTodayISO()));
  const monthMinutes = currentMonthShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
  const monthIncome = currentMonthShifts.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
  const monthCells = getMonthMatrix(month);

  if (!mounted) return <LoadingPanel />;

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">月历视图</div>
              <div className="text-xs opacity-60">点任意日期会从底部弹出详情抽屉</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-2xl bg-white/70 p-2 hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
              <div className="rounded-2xl bg-white/70 px-3 py-2 text-sm font-medium">{month.getFullYear()} / {month.getMonth() + 1}</div>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-2xl bg-white/70 p-2 hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs opacity-60">{["一","二","三","四","五","六","日"].map((d) => <div key={d} className="py-1">周{d}</div>)}</div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthCells.map((dateObj) => {
              const iso = dateObj.toISOString().slice(0, 10);
              const list = byDate[iso] || [];
              const minutes = list.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
              const income = list.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
              const isCurrent = dateObj.getMonth() === month.getMonth();
              const intensity = Math.min(1, minutes / (8 * 60));
              return (
                <button key={iso} onClick={() => { setSelectedDate(iso); setOpen(true); }} className={`rounded-2xl border border-white/60 p-2 text-left shadow-sm transition hover:scale-[1.01] ${isCurrent ? "bg-white/70" : "bg-white/40 text-slate-400"}`} style={{ opacity: 0.62 + intensity * 0.38 }}>
                  <div className="flex items-center justify-between"><div className="text-[11px] font-medium">{dateObj.getDate()}</div>{iso === getTodayISO() && <div className={`${theme.accent} h-2 w-2 rounded-full`} />}</div>
                  <div className="mt-2 min-h-[28px] text-[10px] leading-4 opacity-70">{list.length ? <>{(minutes / 60).toFixed(1)}h<br />{formatCurrency(income, settings.currency)}</> : "休息"}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
            <div className="text-sm font-semibold">已选日期概览</div>
            <div className="mt-4 rounded-3xl bg-white/70 p-4">
              <div className="font-semibold">{formatDateLabel(selectedDate)}</div>
              <div className="mt-1 text-sm opacity-70">{selectedDayShifts.length ? `${selectedDayShifts.length} 个班次` : "暂无班次"}</div>
              <div className="mt-3 space-y-2">
                {selectedDayShifts.slice(0, 3).map((shift) => (
                  <div key={shift.id} className="rounded-2xl bg-white/85 px-3 py-3 text-sm">
                    <div className="font-medium">{shift.isDayOff ? "休息日" : `${shift.startTime} - ${shift.endTime}`}</div>
                    <div className="mt-1 opacity-70">{shift.locationName || "未设置地点"} · {formatCurrency(settings.showNetPay ? shift.netPay : shift.grossPay, settings.currency)}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setOpen(true)} className={`${theme.button} mt-4 w-full rounded-2xl px-4 py-3 text-sm font-medium`}>查看完整详情</button>
            </div>
          </div>
          <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
            <div className="text-sm font-semibold">本月亮点</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-white/70 p-4">本月总工时：<span className="font-semibold">{prettyDuration(monthMinutes)}</span></div>
              <div className="rounded-2xl bg-white/70 p-4">本月总收入：<span className="font-semibold">{formatCurrency(monthIncome, settings.currency)}</span></div>
            </div>
          </div>
        </div>
      </div>
      <DayDrawer open={open} onClose={() => setOpen(false)} date={selectedDate} dayShifts={selectedDayShifts} theme={theme} currency={settings.currency} showNetPay={settings.showNetPay} />
    </>
  );
}
