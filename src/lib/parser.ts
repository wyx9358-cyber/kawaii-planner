import { ParsedShiftDraft, Settings } from "@/lib/types";

export function normalizeLooseTime(hourStr?: string, minuteStr?: string, meridiem?: string, fallbackMeridiem?: string) {
  let hour = Number(hourStr);
  const minute = Number(minuteStr || 0);
  const m = (meridiem || fallbackMeridiem || "").toLowerCase();
  if (!m) {
    if (hour >= 1 && hour <= 7) hour += 12;
  } else if (m === "pm" && hour < 12) {
    hour += 12;
  } else if (m === "am" && hour === 12) {
    hour = 0;
  }
  if (Number.isNaN(hour) || hour > 23 || minute > 59) return "";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function parseNaturalLanguageSchedule(text: string, importWeekStart: Date, defaults: Settings): ParsedShiftDraft[] {
  const weekdayMap: Record<string, number> = {
    "周一": 0,
    "星期一": 0,
    monday: 0,
    mon: 0,
    "周二": 1,
    "星期二": 1,
    tuesday: 1,
    tue: 1,
    tues: 1,
    "周三": 2,
    "星期三": 2,
    wednesday: 2,
    wed: 2,
    "周四": 3,
    "星期四": 3,
    thursday: 3,
    thu: 3,
    thur: 3,
    "周五": 4,
    "星期五": 4,
    friday: 4,
    fri: 4,
    "周六": 5,
    "星期六": 5,
    saturday: 5,
    sat: 5,
    "周日": 6,
    "星期日": 6,
    "星期天": 6,
    sunday: 6,
    sun: 6,
  };

  const normalized = text
    .replace(/，/g, ",")
    .replace(/：/g, ":")
    .replace(/；/g, ";")
    .replace(/
/g, ",")
    .replace(/到/g, "-")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/半小时|半小時/g, "30分钟")
    .replace(/branch/gi, "Branch");

  const globalBreakMatch = normalized.match(/每天.*?(\d{1,3})\s*分钟|every day.*?break\s*(\d{1,3})\s*min/i);
  const fallbackBreak = Number(globalBreakMatch?.[1] || globalBreakMatch?.[2] || defaults.defaultBreakMinutes || 30);
  const segments = normalized.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);

  const weekDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(importWeekStart);
    d.setDate(d.getDate() + index);
    return d.toISOString().slice(0, 10);
  });

  const weekdayLabels = Object.keys(weekdayMap).sort((a, b) => b.length - a.length);
  const drafts: ParsedShiftDraft[] = [];

  segments.forEach((segment) => {
    const lower = segment.toLowerCase();
    const foundWeekdays: number[] = [];
    weekdayLabels.forEach((label) => {
      if (lower.includes(label.toLowerCase())) {
        const index = weekdayMap[label];
        if (!foundWeekdays.includes(index)) foundWeekdays.push(index);
      }
    });
    if (!foundWeekdays.length) return;

    const isDayOff = /休息|off|day off/i.test(lower);
    const locationMatch = segment.match(/(Vancouver Branch|Richmond Branch|Vancouver|Richmond)/i);
    const locationName = locationMatch?.[0] || "";
    const breakMatch = segment.match(/(\d{1,3})\s*分钟|break\s*(\d{1,3})\s*min/i);
    const breakMinutes = Number(breakMatch?.[1] || breakMatch?.[2] || fallbackBreak);
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;
    const timeMatches = Array.from(segment.matchAll(timeRegex));

    foundWeekdays.forEach((weekdayIndex, idx) => {
      const date = weekDates[weekdayIndex];
      const timeMatch = timeMatches[idx] || timeMatches[0];
      let startTime = "";
      let endTime = "";
      const warnings: string[] = [];
      let confidence = 0.92;

      if (!isDayOff && timeMatch) {
        startTime = normalizeLooseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[6]);
        endTime = normalizeLooseTime(timeMatch[4], timeMatch[5], timeMatch[6], timeMatch[6]);
        if (!startTime || !endTime) {
          warnings.push("时间格式需要确认");
          confidence = 0.55;
        }
      } else if (!isDayOff) {
        warnings.push("未识别到时间段");
        confidence = 0.35;
      }

      drafts.push({
        tempId: crypto.randomUUID(),
        sourceText: segment,
        date,
        locationName,
        startTime,
        endTime,
        breakMinutes,
        isDayOff,
        confidence,
        warnings,
      });
    });
  });

  return drafts.sort((a, b) => a.date.localeCompare(b.date));
}
