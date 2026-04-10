import { ComputedShift, Settings, Shift, Task, TaskLog } from "@/lib/types";
import { safeText } from "@/lib/utils";

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportBackupJson(payload: {
  settings: Settings;
  shifts: Shift[];
  tasks: Task[];
  taskLogs: TaskLog[];
}, today: string) {
  downloadBlob(`kawaii-shift-backup-${today}.json`, JSON.stringify(payload, null, 2), "application/json");
}

export function exportShiftCsv(shifts: ComputedShift[], today: string) {
  const header = ["date", "location", "role", "start", "end", "breakMinutes", "workMinutes", "grossPay", "netPay", "note"];
  const rows = shifts.map((s) => [
    s.date,
    s.locationName || "",
    s.roleName || "",
    s.startTime || "",
    s.endTime || "",
    s.breakMinutes || 0,
    s.workMinutes || 0,
    (s.grossPay || 0).toFixed(2),
    (s.netPay || 0).toFixed(2),
    safeText(s.note || ""),
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${safeText(cell)}"`).join(",")).join("
");
  downloadBlob(`kawaii-shifts-${today}.csv`, csv, "text/csv;charset=utf-8;");
}
