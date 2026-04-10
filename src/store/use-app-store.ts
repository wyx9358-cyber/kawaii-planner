"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, SAMPLE_SHIFTS, SAMPLE_TASK_LOGS, SAMPLE_TASKS } from "@/lib/constants";
import { ParsedShiftDraft, Settings, Shift, Task, TaskLog } from "@/lib/types";

type AppState = {
  settings: Settings;
  shifts: Shift[];
  tasks: Task[];
  taskLogs: TaskLog[];
  setSettings: (patch: Partial<Settings>) => void;
  updateReminder: (key: keyof Settings["reminders"], value: boolean) => void;
  addShift: (shift: Shift) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  importDrafts: (drafts: ParsedShiftDraft[]) => void;
  addTask: (task: Task) => void;
  toggleTask: (taskId: string, date: string) => void;
  resetDemo: () => void;
};

function sortShifts(items: Shift[]) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      shifts: SAMPLE_SHIFTS,
      tasks: SAMPLE_TASKS,
      taskLogs: SAMPLE_TASK_LOGS,
      setSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      updateReminder: (key, value) => set((state) => ({ settings: { ...state.settings, reminders: { ...state.settings.reminders, [key]: value } } })),
      addShift: (shift) => set((state) => ({ shifts: sortShifts([...state.shifts, shift]) })),
      updateShift: (shift) => set((state) => ({ shifts: sortShifts(state.shifts.map((item) => (item.id === shift.id ? shift : item))) })),
      deleteShift: (id) => set((state) => ({ shifts: state.shifts.filter((item) => item.id !== id) })),
      importDrafts: (drafts) =>
        set((state) => ({
          shifts: sortShifts([
            ...state.shifts,
            ...drafts.map((draft) => ({
              id: crypto.randomUUID(),
              date: draft.date,
              locationName: draft.locationName || "Vancouver Branch",
              roleName: "Intern",
              startTime: draft.startTime || "",
              endTime: draft.endTime || "",
              breakMinutes: draft.breakMinutes,
              isDayOff: draft.isDayOff,
              isBreakPaid: state.settings.paidBreak,
              baseHourlyRate: draft.locationName && state.settings.locationRates[draft.locationName]
                ? state.settings.locationRates[draft.locationName]
                : state.settings.defaultHourlyRate,
              bonusAmount: 0,
              tipsAmount: 0,
              deductionAmount: 0,
              note: `来源：${draft.sourceText}`,
              tags: ["解析导入"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          ]),
        })),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      toggleTask: (taskId, date) =>
        set((state) => {
          const existing = state.taskLogs.find((log) => log.taskId === taskId && log.date === date);
          if (existing) {
            return {
              taskLogs: state.taskLogs.map((log) =>
                log.id === existing.id
                  ? { ...log, completed: !log.completed, completedAt: !log.completed ? new Date().toISOString() : null }
                  : log,
              ),
            };
          }
          return {
            taskLogs: [
              ...state.taskLogs,
              {
                id: crypto.randomUUID(),
                taskId,
                date,
                completed: true,
                completedAt: new Date().toISOString(),
              },
            ],
          };
        }),
      resetDemo: () => set({ settings: DEFAULT_SETTINGS, shifts: SAMPLE_SHIFTS, tasks: SAMPLE_TASKS, taskLogs: SAMPLE_TASK_LOGS }),
    }),
    {
      name: "kawaii-shift-app-v3",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
