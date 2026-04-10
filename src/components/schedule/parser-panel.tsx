"use client";

import { Wand2 } from "lucide-react";
import { ParsedShiftDraft, ThemePreset } from "@/lib/types";
import { formatDateLabel } from "@/lib/date";

export function ParserPanel({
  theme,
  input,
  onInput,
  onParse,
  drafts,
  onImport,
}: {
  theme: ThemePreset;
  input: string;
  onInput: (value: string) => void;
  onParse: () => void;
  drafts: ParsedShiftDraft[];
  onImport: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wand2 className="h-4 w-4" />
          文本自动解析导入
        </div>
        <textarea value={input} onChange={(e) => onInput(e.target.value)} className="field mt-4 min-h-[156px]" placeholder="粘贴排班文本..." />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button onClick={onParse} className={`${theme.button} rounded-2xl px-4 py-3 text-sm font-medium`}>解析文本</button>
          <button onClick={() => onInput("")} className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium hover:bg-white">清空</button>
        </div>
        <div className="mt-3 text-xs opacity-60">支持：周一 / Monday / 2-7pm / 14:00-19:00 / 周五周六休息 / 每天休息30分钟</div>
      </div>

      <div className={`${theme.card} rounded-[28px] border border-white/60 p-4 shadow-soft backdrop-blur-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">解析预览</div>
            <div className="text-xs opacity-60">低置信度会高亮提醒你检查</div>
          </div>
          <button disabled={!drafts.length} onClick={onImport} className={`rounded-2xl px-4 py-2 text-sm font-medium ${drafts.length ? theme.button : "bg-slate-200 text-slate-400"}`}>确认导入</button>
        </div>
        <div className="mt-4 space-y-3">
          {!drafts.length && <div className="rounded-[24px] bg-white/70 p-4 text-sm opacity-70">先解析文本，这里就会出现可视化结果哦～</div>}
          {drafts.map((draft) => (
            <div key={draft.tempId} className="rounded-[24px] bg-white/70 p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{formatDateLabel(draft.date)}</div>
                  <div className="mt-1 opacity-70">{draft.sourceText}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`${theme.soft} rounded-full px-3 py-1 text-xs`}>{draft.isDayOff ? "休息日" : `${draft.startTime || "--:--"} - ${draft.endTime || "--:--"}`}</span>
                    {!!draft.locationName && <span className="rounded-full bg-white px-3 py-1 text-xs">{draft.locationName}</span>}
                    <span className="rounded-full bg-white px-3 py-1 text-xs">休息 {draft.breakMinutes || 0} 分钟</span>
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-medium ${draft.confidence >= 0.8 ? "bg-emerald-100 text-emerald-700" : draft.confidence >= 0.5 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                  置信度 {Math.round(draft.confidence * 100)}%
                </div>
              </div>
              {!!draft.warnings?.length && <div className="mt-2 text-xs text-amber-700">⚠ {draft.warnings.join("、")}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
