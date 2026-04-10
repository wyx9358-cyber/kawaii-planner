"use client";

import { Palette } from "lucide-react";
import { CuteCard } from "@/components/ui/cute-card";
import { useAppStore } from "@/store/use-app-store";
import { DEFAULT_SETTINGS, THEME_PRESETS } from "@/lib/constants";
import { exportBackupJson, exportShiftCsv } from "@/lib/exporters";
import { computeShift } from "@/lib/payroll";
import { getTodayISO } from "@/lib/date";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMounted } from "@/hooks/use-mounted";

export default function SettingsPage() {
  const mounted = useMounted();
  const settings = useAppStore((state) => state.settings);
  const shifts = useAppStore((state) => state.shifts);
  const tasks = useAppStore((state) => state.tasks);
  const taskLogs = useAppStore((state) => state.taskLogs);
  const setSettings = useAppStore((state) => state.setSettings);
  const updateReminder = useAppStore((state) => state.updateReminder);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const theme = THEME_PRESETS[settings.theme];
  const today = getTodayISO();

  if (!mounted) return <LoadingPanel />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <CuteCard className={`${theme.card} p-4`}>
        <div className="flex items-center gap-2 text-sm font-semibold"><Palette className="h-4 w-4" /> 主题与装扮</div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.values(THEME_PRESETS).map((preset) => (
            <button key={preset.key} onClick={() => setSettings({ theme: preset.key })} className={`rounded-[24px] border border-white/60 bg-white/70 p-3 text-left transition hover:scale-[1.01] ${settings.theme === preset.key ? "ring-2 ring-offset-2" : ""}`}>
              <div className={`h-16 rounded-2xl bg-gradient-to-br ${preset.bg}`} />
              <div className="mt-2 text-sm font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm"><div className="mb-1 opacity-70">自定义壁纸 URL</div><input value={settings.wallpaper} onChange={(e) => setSettings({ wallpaper: e.target.value })} className="field" placeholder="https://..." /></label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><div className="mb-1 opacity-70">Vancouver 时薪</div><input type="number" step="0.1" value={settings.locationRates["Vancouver Branch"]} onChange={(e) => setSettings({ locationRates: { ...settings.locationRates, "Vancouver Branch": Number(e.target.value || 0) } })} className="field" /></label>
          <label className="text-sm"><div className="mb-1 opacity-70">Richmond 时薪</div><input type="number" step="0.1" value={settings.locationRates["Richmond Branch"]} onChange={(e) => setSettings({ locationRates: { ...settings.locationRates, "Richmond Branch": Number(e.target.value || 0) } })} className="field" /></label>
        </div>
        <label className="mt-3 flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-3 text-sm"><input checked={settings.paidBreak} onChange={(e) => setSettings({ paidBreak: e.target.checked })} type="checkbox" className="h-4 w-4" /> 休息时间按有薪处理</label>
      </CuteCard>

      <CuteCard className={`${theme.card} p-4`}>
        <div className="text-sm font-semibold">提醒与数据</div>
        <div className="mt-4 space-y-3">
          {([
            ["beforeWork", "上班前提醒"],
            ["afterWork", "下班提醒"],
            ["missingRecord", "漏记提醒"],
            ["weeklySummary", "每周总结提醒"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm">
              <span>{label}</span>
              <input type="checkbox" checked={settings.reminders[key]} onChange={(e) => updateReminder(key, e.target.checked)} className="h-4 w-4" />
            </label>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => exportShiftCsv(shifts.map((shift) => computeShift(shift, settings)), today)} className={`${theme.button} rounded-2xl px-4 py-3 text-sm font-medium`}>导出 CSV</button>
          <button onClick={() => exportBackupJson({ settings, shifts, tasks, taskLogs }, today)} className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium hover:bg-white">备份 JSON</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={resetDemo} className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium hover:bg-white">恢复示例数据</button>
          <button onClick={() => setSettings(DEFAULT_SETTINGS)} className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium hover:bg-white">重置设置</button>
        </div>
      </CuteCard>
    </div>
  );
}
