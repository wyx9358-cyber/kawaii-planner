"use client";

import { X, Clock3, Wallet } from "lucide-react";
import { ComputedShift, ThemePreset } from "@/lib/types";
import { StatPill } from "@/components/ui/stat-pill";
import { formatCurrency, prettyDuration } from "@/lib/utils";
import { formatDateLabel } from "@/lib/date";

export function DayDrawer({
  open,
  onClose,
  date,
  dayShifts,
  theme,
  currency,
  showNetPay,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  dayShifts: ComputedShift[];
  theme: ThemePreset;
  currency: string;
  showNetPay: boolean;
}) {
  if (!open) return null;
  const totalMinutes = dayShifts.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
  const totalIncome = dayShifts.reduce((sum, s) => sum + ((showNetPay ? s.netPay : s.grossPay) || 0), 0);

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm">
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl rounded-t-[32px] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-60">当日详情</div>
            <div className="text-lg font-bold">{formatDateLabel(date)}</div>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <StatPill icon={Clock3} label="总工时" value={prettyDuration(totalMinutes)} softClass={theme.soft} />
          <StatPill icon={Wallet} label="总收入" value={formatCurrency(totalIncome, currency)} softClass="bg-slate-100 text-slate-700" />
        </div>
        <div className="mt-4 space-y-3">
          {!dayShifts.length && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">这一天还没有任何班次记录。</div>}
          {dayShifts.map((shift) => (
            <div key={shift.id} className="rounded-3xl bg-slate-50 p-4">
              <div className="font-semibold">{shift.isDayOff ? "休息日" : `${shift.startTime} - ${shift.endTime}`}</div>
              <div className="mt-1 text-sm text-slate-500">{shift.locationName || "未设置地点"} · {shift.roleName || "未设置岗位"}</div>
              {!shift.isDayOff && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={`${theme.soft} rounded-full px-3 py-1`}>休息 {shift.breakMinutes} 分钟</span>
                  <span className="rounded-full bg-white px-3 py-1">实际 {prettyDuration(shift.workMinutes || 0)}</span>
                  <span className="rounded-full bg-white px-3 py-1">{formatCurrency(showNetPay ? shift.netPay : shift.grossPay, currency)}</span>
                </div>
              )}
              {!!shift.note && <div className="mt-3 text-sm text-slate-500">备注：{shift.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
