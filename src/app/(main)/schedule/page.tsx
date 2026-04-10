"use client";

import { useMemo, useState } from "react";
import type { ParsedShiftDraft } from "@/lib/types";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { THEME_PRESETS } from "@/lib/constants";
import { computeShift, groupByDate } from "@/lib/payroll";
import { formatCurrency, prettyDuration } from "@/lib/utils";
import { formatDateLabel, getTodayISO, getWeekDates, getWeekStart } from "@/lib/date";
import { parseNaturalLanguageSchedule } from "@/lib/parser";
import { createDefaultForm, ShiftForm, ShiftFormValues } from "@/components/schedule/shift-form";
import { ParserPanel } from "@/components/schedule/parser-panel";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMounted } from "@/hooks/use-mounted";

export default function SchedulePage() {
  const mounted = useMounted();
  const settings = useAppStore((state) => state.settings);
  const shifts = useAppStore((state) => state.shifts);
  const addShift = useAppStore((state) => state.addShift);
  const updateShift = useAppStore((state) => state.updateShift);
  const deleteShift = useAppStore((state) => state.deleteShift);
  const importDrafts = useAppStore((state) => state.importDrafts);
  const theme = THEME_PRESETS[settings.theme];

  const [weekOffset, setWeekOffset] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [parserInput, setParserInput] = useState("下周一 Vancouver Branch 2-7pm，周二 12-5pm Vancouver，周三 1:30-6:30pm，周四 12-6:30pm，周五周六休息，周日 Richmond Branch 2-7pm，每天休息30分钟");
  const [parsedDrafts, setParsedDrafts] = useState<ParsedShiftDraft[]>([]);
  const [form, setForm] = useState<ShiftFormValues>(createDefaultForm(getTodayISO(), settings.defaultBreakMinutes, settings.defaultHourlyRate));

  const computed = useMemo(() => shifts.map((shift) => computeShift(shift, settings)), [shifts, settings]);
  const weekDates = getWeekDates(new Date(), weekOffset);
  const weekShifts = computed.filter((shift) => weekDates.includes(shift.date));
  const byDate = groupByDate(weekShifts);

  function resetForm(date = getTodayISO()) {
    setEditingId("");
    setForm(createDefaultForm(date, settings.defaultBreakMinutes, settings.defaultHourlyRate));
  }

  function saveShift() {
    const payload = {
      id: editingId || crypto.randomUUID(),
      date: form.date,
      locationName: form.locationName,
      roleName: form.roleName,
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes: Number(form.breakMinutes || 0),
      isDayOff: form.isDayOff,
      isBreakPaid: settings.paidBreak,
      baseHourlyRate: Number(form.baseHourlyRate || settings.defaultHourlyRate),
      bonusAmount: Number(form.bonusAmount || 0),
      tipsAmount: Number(form.tipsAmount || 0),
      deductionAmount: Number(form.deductionAmount || 0),
      note: form.note,
      tags: editingId ? shifts.find((item) => item.id === editingId)?.tags || [] : [],
      createdAt: editingId ? shifts.find((item) => item.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    editingId ? updateShift(payload) : addShift(payload);
    resetForm(form.date);
  }

  function startEdit(id: string) {
    const shift = shifts.find((item) => item.id === id);
    if (!shift) return;
    setEditingId(shift.id);
    setForm({
      date: shift.date,
      locationName: shift.locationName || "",
      roleName: shift.roleName || "",
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
      breakMinutes: shift.breakMinutes || 0,
      isDayOff: !!shift.isDayOff,
      baseHourlyRate: shift.baseHourlyRate || settings.defaultHourlyRate,
      bonusAmount: shift.bonusAmount || 0,
      tipsAmount: shift.tipsAmount || 0,
      deductionAmount: shift.deductionAmount || 0,
      note: shift.note || "",
    });
  }

  function parseText() {
    const start = getWeekStart(new Date());
    start.setDate(start.getDate() + weekOffset * 7 + (parserInput.includes("下周") ? 7 : 0));
    setParsedDrafts(parseNaturalLanguageSchedule(parserInput, start, settings));
  }

  function copyLastWeek() {
    const currentWeek = weekDates;
    const previousWeek = getWeekDates(new Date(), weekOffset - 1);
    const source = shifts.filter((shift) => previousWeek.includes(shift.date));
    source.forEach((shift) => {
      const idx = previousWeek.indexOf(shift.date);
      addShift({ ...shift, id: crypto.randomUUID(), date: currentWeek[idx], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    });
  }

  if (!mounted) return <LoadingPanel />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold">周排班</div>
              <div className="text-xs opacity-60">现在支持同一天多个班次</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setWeekOffset((v) => v - 1)} className="rounded-2xl bg-white/70 px-3 py-2 text-sm hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setWeekOffset(0)} className="rounded-2xl bg-white/70 px-3 py-2 text-sm hover:bg-white">今天</button>
              <button onClick={() => setWeekOffset((v) => v + 1)} className="rounded-2xl bg-white/70 px-3 py-2 text-sm hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {weekDates.map((date) => {
              const list = byDate[date] || [];
              const dayMinutes = list.reduce((sum, s) => sum + (s.workMinutes || 0), 0);
              const dayIncome = list.reduce((sum, s) => sum + ((settings.showNetPay ? s.netPay : s.grossPay) || 0), 0);
              return (
                <div key={date} className="rounded-[24px] bg-white/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{formatDateLabel(date)}</div>
                      <div className="text-xs opacity-60">{list.length ? `${list.length} 个班次 · ${prettyDuration(dayMinutes)} · ${formatCurrency(dayIncome, settings.currency)}` : "还没有记录"}</div>
                    </div>
                    <button onClick={() => setForm((prev) => ({ ...createDefaultForm(date, settings.defaultBreakMinutes, settings.defaultHourlyRate), date }))} className={`${theme.button} rounded-2xl px-3 py-2 text-xs font-medium`}>添加班次</button>
                  </div>
                  <div className="space-y-2">
                    {!list.length && <div className="rounded-2xl bg-white/75 px-3 py-3 text-sm opacity-70">空空的也很可爱，点右上角可以加班次哦～</div>}
                    {list.map((shift) => (
                      <div key={shift.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white/85 px-3 py-3 text-sm">
                        <div>
                          <div className="font-medium">{shift.isDayOff ? "休息日" : `${shift.startTime} - ${shift.endTime}`}</div>
                          <div className="mt-1 opacity-70">{shift.locationName || "未设置地点"} · {shift.roleName || "未设置岗位"}</div>
                          {!shift.isDayOff && <div className="mt-1 opacity-70">{prettyDuration(shift.workMinutes || 0)} · {formatCurrency(settings.showNetPay ? shift.netPay : shift.grossPay, settings.currency)}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(shift.id)} className="rounded-2xl bg-slate-100 p-2 hover:bg-slate-200"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => deleteShift(shift.id)} className="rounded-2xl bg-slate-100 p-2 hover:bg-slate-200"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={copyLastWeek} className="mt-4 w-full rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium hover:bg-white">复制上一周班次</button>
        </div>
      </div>

      <div className="space-y-4">
        <ShiftForm theme={theme} value={form} editing={!!editingId} onChange={setForm} onSave={saveShift} onCancel={() => resetForm(form.date)} />
        <ParserPanel theme={theme} input={parserInput} onInput={setParserInput} onParse={parseText} drafts={parsedDrafts} onImport={() => { importDrafts(parsedDrafts); setParsedDrafts([]); }} />
      </div>
    </div>
  );
}
