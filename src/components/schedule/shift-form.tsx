"use client";

import { useEffect, type ReactNode } from "react";
import { ThemePreset } from "@/lib/types";

export type ShiftFormValues = {
  date: string;
  locationName: string;
  roleName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number | string;
  isDayOff: boolean;
  baseHourlyRate: number | string;
  bonusAmount: number | string;
  tipsAmount: number | string;
  deductionAmount: number | string;
  note: string;
};

const emptyForm = (date: string, breakMinutes: number, rate: number): ShiftFormValues => ({
  date,
  locationName: "Vancouver Branch",
  roleName: "Intern",
  startTime: "14:00",
  endTime: "19:00",
  breakMinutes,
  isDayOff: false,
  baseHourlyRate: rate,
  bonusAmount: 0,
  tipsAmount: 0,
  deductionAmount: 0,
  note: "",
});

export function createDefaultForm(date: string, breakMinutes: number, rate: number) {
  return emptyForm(date, breakMinutes, rate);
}

export function ShiftForm({
  theme,
  value,
  editing,
  onChange,
  onSave,
  onCancel,
}: {
  theme: ThemePreset;
  value: ShiftFormValues;
  editing: boolean;
  onChange: (value: ShiftFormValues) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("kawaii-shift-draft", JSON.stringify(value));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{editing ? "编辑班次" : "新建班次"}</div>
          <div className="text-xs opacity-60">自动草稿保存已开启</div>
        </div>
        {editing && <button onClick={onCancel} className="rounded-2xl bg-white/70 px-3 py-2 text-xs hover:bg-white">取消编辑</button>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="日期"><input value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} type="date" className="field" /></Field>
        <Field label="地点"><input value={value.locationName} onChange={(e) => onChange({ ...value, locationName: e.target.value })} className="field" /></Field>
        <Field label="岗位"><input value={value.roleName} onChange={(e) => onChange({ ...value, roleName: e.target.value })} className="field" /></Field>
        <Field label="时薪"><input value={value.baseHourlyRate} onChange={(e) => onChange({ ...value, baseHourlyRate: e.target.value })} type="number" step="0.1" className="field" /></Field>
        <Field label="开始时间"><input value={value.startTime} onChange={(e) => onChange({ ...value, startTime: e.target.value })} type="time" className="field" /></Field>
        <Field label="结束时间"><input value={value.endTime} onChange={(e) => onChange({ ...value, endTime: e.target.value })} type="time" className="field" /></Field>
        <Field label="休息分钟"><input value={value.breakMinutes} onChange={(e) => onChange({ ...value, breakMinutes: e.target.value })} type="number" className="field" /></Field>
        <Field label="奖金"><input value={value.bonusAmount} onChange={(e) => onChange({ ...value, bonusAmount: e.target.value })} type="number" step="0.01" className="field" /></Field>
        <Field label="小费"><input value={value.tipsAmount} onChange={(e) => onChange({ ...value, tipsAmount: e.target.value })} type="number" step="0.01" className="field" /></Field>
        <Field label="扣款"><input value={value.deductionAmount} onChange={(e) => onChange({ ...value, deductionAmount: e.target.value })} type="number" step="0.01" className="field" /></Field>
      </div>
      <label className="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-3 text-sm">
        <input checked={value.isDayOff} onChange={(e) => onChange({ ...value, isDayOff: e.target.checked })} type="checkbox" className="h-4 w-4" />
        设为休息日
      </label>
      <label className="mt-3 block text-sm">
        <div className="mb-1 opacity-70">备注</div>
        <textarea value={value.note} onChange={(e) => onChange({ ...value, note: e.target.value })} className="field min-h-[88px]" placeholder="今天需要做什么呢～" />
      </label>
      <button onClick={onSave} className={`${theme.button} mt-4 w-full rounded-2xl px-4 py-3 text-sm font-medium`}>
        {editing ? "保存修改" : "保存班次"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm">
      <div className="mb-1 opacity-70">{label}</div>
      {children}
    </label>
  );
}
