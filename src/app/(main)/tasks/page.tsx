"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { CuteCard } from "@/components/ui/cute-card";
import { useAppStore } from "@/store/use-app-store";
import { THEME_PRESETS } from "@/lib/constants";
import { getTodayISO } from "@/lib/date";
import { LoadingPanel } from "@/components/ui/loading-panel";
import { useMounted } from "@/hooks/use-mounted";

export default function TasksPage() {
  const mounted = useMounted();
  const settings = useAppStore((state) => state.settings);
  const tasks = useAppStore((state) => state.tasks);
  const taskLogs = useAppStore((state) => state.taskLogs);
  const addTask = useAppStore((state) => state.addTask);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const theme = THEME_PRESETS[settings.theme];
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const today = getTodayISO();
  const completedTaskIds = new Set(taskLogs.filter((log) => log.date === today && log.completed).map((log) => log.taskId));

  if (!mounted) return <LoadingPanel />;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <CuteCard className={`${theme.card} p-4`}>
        <div className="text-sm font-semibold">新增任务</div>
        <div className="mt-4 flex gap-2">
          <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="field flex-1" placeholder="例如：完成复盘" />
          <button onClick={() => {
            if (!newTaskTitle.trim()) return;
            addTask({
              id: crypto.randomUUID(),
              title: newTaskTitle.trim(),
              category: "custom",
              color: "violet",
              icon: "🌷",
              priority: "medium",
              repeatRule: "daily",
              reminderEnabled: false,
              streakCount: 0,
              note: "",
            });
            setNewTaskTitle("");
          }} className={`${theme.button} rounded-2xl px-4 py-3 text-sm font-medium`}>添加</button>
        </div>
        <div className="mt-4 rounded-[24px] bg-white/70 p-4 text-sm opacity-70">下一步还可以继续加：番茄钟、分类筛选、优先级排序、任务海报导出。</div>
      </CuteCard>

      <CuteCard className={`${theme.card} p-4`}>
        <div className="flex items-center justify-between">
          <div><div className="text-sm font-semibold">今日任务打卡</div><div className="text-xs opacity-60">轻点即可勾选完成</div></div>
          <div className={`${theme.soft} rounded-full px-3 py-1 text-xs font-medium`}>{completedTaskIds.size}/{tasks.length} 完成</div>
        </div>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => {
            const done = completedTaskIds.has(task.id);
            return (
              <div key={task.id} className="flex items-center justify-between rounded-[24px] bg-white/70 p-4">
                <button onClick={() => toggleTask(task.id, today)} className="flex items-center gap-3 text-left">
                  {done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-400" />}
                  <div>
                    <div className="font-medium">{task.icon} {task.title}</div>
                    <div className="text-xs opacity-60">{task.category} · 连续 {task.streakCount || 0} 天</div>
                  </div>
                </button>
                <div className="text-xs opacity-60">{task.priority}</div>
              </div>
            );
          })}
        </div>
      </CuteCard>
    </div>
  );
}
