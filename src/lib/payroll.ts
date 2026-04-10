import { ComputedShift, Settings, Shift } from "@/lib/types";

export function toMinutes(time?: string) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getDayType(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`).getDay();
  return [0, 6].includes(d) ? "weekend" : "weekday";
}

export function resolveRate(shift: Shift, settings: Settings) {
  return Number(
    shift.baseHourlyRate || settings.locationRates?.[shift.locationName || ""] || settings.defaultHourlyRate || 0,
  );
}

export function computeShift(shift: Shift, settings: Settings): ComputedShift {
  if (shift.isDayOff) {
    return {
      ...shift,
      rawMinutes: 0,
      regularMinutes: 0,
      workMinutes: 0,
      overtimeMinutes: 0,
      grossPay: 0,
      netPay: 0,
      appliedRate: 0,
    };
  }

  const rawMinutes = Math.max(0, toMinutes(shift.endTime) - toMinutes(shift.startTime));
  const paidBreak = shift.isBreakPaid ?? settings.paidBreak;
  const breakMinutes = Number(shift.breakMinutes ?? settings.defaultBreakMinutes ?? 0);
  const workMinutes = Math.max(0, rawMinutes - (paidBreak ? 0 : breakMinutes));
  const overtimeThresholdMinutes = Number(settings.overtimeThresholdHours || 8) * 60;
  const overtimeMinutes = Math.max(0, workMinutes - overtimeThresholdMinutes);
  const regularMinutes = Math.max(0, workMinutes - overtimeMinutes);
  const rate = resolveRate(shift, settings);
  const weekendMultiplier = getDayType(shift.date) === "weekend" ? Number(settings.weekendMultiplier || 1) : 1;
  const overtimeMultiplier = Number(settings.overtimeMultiplier || 1.5);
  const bonus = Number(shift.bonusAmount || 0);
  const tips = Number(shift.tipsAmount || 0);
  const deductions = Number(shift.deductionAmount || 0);
  const regularPay = (regularMinutes / 60) * rate * weekendMultiplier;
  const overtimePay = (overtimeMinutes / 60) * rate * overtimeMultiplier * weekendMultiplier;
  const grossPay = regularPay + overtimePay + bonus + tips - deductions;
  const netPay = grossPay * (1 - Number(settings.taxRate || 0));

  return {
    ...shift,
    breakMinutes,
    rawMinutes,
    regularMinutes,
    workMinutes,
    overtimeMinutes,
    grossPay,
    netPay,
    appliedRate: rate,
  };
}

export function groupByDate<T extends { date: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    (acc[item.date] ||= []).push(item);
    return acc;
  }, {});
}
