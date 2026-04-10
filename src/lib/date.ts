export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function getDateOffsetISO(offset: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(d);
}

export function formatShortWeekday(dateStr: string) {
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(`${dateStr}T12:00:00`));
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekDates(baseDate = new Date(), offsetWeeks = 0) {
  const start = getWeekStart(baseDate);
  start.setDate(start.getDate() + offsetWeeks * 7);
  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return d.toISOString().slice(0, 10);
  });
}

export function getMonthMatrix(currentMonth: Date) {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startWeek = getWeekStart(start);
  return Array.from({ length: 35 }).map((_, idx) => {
    const d = new Date(startWeek);
    d.setDate(startWeek.getDate() + idx);
    return d;
  });
}

export function getMonthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}
